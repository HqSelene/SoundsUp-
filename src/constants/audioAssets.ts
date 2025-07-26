import { Asset } from 'expo-asset';

export const AUDIO_ASSETS = {
  jhope: require('../../assets/example/jhope.m4a'),
  jhope_wav: require('../../assets/example/jhope.wav'),
};

export const getAudioUri = async (assetKey: string) => {
  const asset = AUDIO_ASSETS[assetKey];
  if (!asset) return null;
  
  const assetModule = Asset.fromModule(asset);
  await assetModule.downloadAsync();
  return assetModule.localUri || assetModule.uri;
};