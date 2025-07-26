import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  type: 'audio' | 'image' | 'document' | 'other';
  createdAt: string;
  modifiedAt: string;
}

export class FileManager {
  private static instance: FileManager;
  private audioDirectory: string;
  private cacheDirectory: string;

  private constructor() {
    this.audioDirectory = `${FileSystem.documentDirectory}audio/`;
    this.cacheDirectory = `${FileSystem.cacheDirectory}temp/`;
    this.initializeDirectories();
  }

  static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  private async initializeDirectories() {
    try {
      // 创建音频目录
      const audioInfo = await FileSystem.getInfoAsync(this.audioDirectory);
      if (!audioInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.audioDirectory, { intermediates: true });
      }

      // 创建缓存目录
      const cacheInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (!cacheInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize directories:', error);
    }
  }

  // 保存音频文件
  async saveAudioFile(sourceUri: string, filename?: string): Promise<string> {
    try {
      const fileName = filename || `recording_${Date.now()}.m4a`;
      const destinationUri = `${this.audioDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri
      });
      
      return destinationUri;
    } catch (error) {
      console.error('Failed to save audio file:', error);
      throw error;
    }
  }

  // 获取文件信息
  async getFileInfo(uri: string): Promise<FileInfo | null> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return null;

      const fileName = uri.split('/').pop() || 'unknown';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      let type: FileInfo['type'] = 'other';
      if (['m4a', 'mp3', 'wav', 'aac'].includes(extension)) {
        type = 'audio';
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        type = 'image';
      } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
        type = 'document';
      }

      return {
        uri,
        name: fileName,
        size: info.size || 0,
        type,
        createdAt: new Date(info.modificationTime || Date.now()).toISOString(),
        modifiedAt: new Date(info.modificationTime || Date.now()).toISOString()
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  // 删除文件
  async deleteFile(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // 获取目录下所有文件
  async getDirectoryFiles(directoryUri: string): Promise<FileInfo[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(directoryUri);
      const fileInfos: FileInfo[] = [];

      for (const fileName of files) {
        const fileUri = `${directoryUri}${fileName}`;
        const fileInfo = await this.getFileInfo(fileUri);
        if (fileInfo) {
          fileInfos.push(fileInfo);
        }
      }

      return fileInfos.sort((a, b) => 
        new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get directory files:', error);
      return [];
    }
  }

  // 获取所有音频文件
  async getAllAudioFiles(): Promise<FileInfo[]> {
    return this.getDirectoryFiles(this.audioDirectory);
  }

  // 清理缓存文件
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.cacheDirectory);
      await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // 获取存储使用情况
  async getStorageInfo(): Promise<{ totalSize: number; audioSize: number; cacheSize: number }> {
    try {
      const audioFiles = await this.getAllAudioFiles();
      const audioSize = audioFiles.reduce((total, file) => total + file.size, 0);
      
      const cacheFiles = await this.getDirectoryFiles(this.cacheDirectory);
      const cacheSize = cacheFiles.reduce((total, file) => total + file.size, 0);
      
      return {
        totalSize: audioSize + cacheSize,
        audioSize,
        cacheSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalSize: 0, audioSize: 0, cacheSize: 0 };
    }
  }
}