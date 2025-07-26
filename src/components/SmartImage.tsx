import React, { useState, useEffect } from 'react';
import { Image, View, ImageStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUri, IMAGE_ASSETS } from '../constants/imageAssets';
import { COSMIC_THEME } from '../constants/theme';

interface SmartImageProps {
  source: string | undefined;
  style: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholderStyle?: ViewStyle;
}

export const SmartImage: React.FC<SmartImageProps> = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  placeholderStyle 
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!source) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // 如果是base64格式，直接使用
        if (source.startsWith('data:')) {
          setImageUri(source);
        }
        // 如果是资源键，从IMAGE_ASSETS获取
        else if (source in IMAGE_ASSETS) {
          const uri = await getImageUri(source as keyof typeof IMAGE_ASSETS);
          setImageUri(uri);
        }
        // 否则当作普通URI使用
        else {
          setImageUri(source);
        }
      } catch (err) {
        console.error('Failed to load image:', source, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [source]);

  if (loading || error || !imageUri) {
    return (
      <View style={[style, placeholderStyle, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(123, 104, 238, 0.1)' }]}>
        <Ionicons name="image-outline" size={40} color={COSMIC_THEME.colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image 
      source={{ uri: imageUri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setError(true)}
    />
  );
};