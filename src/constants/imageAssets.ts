import { Asset } from 'expo-asset';

export const IMAGE_ASSETS = {
  jhope_pic: require('../../assets/example/jhope.png'),
  adele_pic: require('../../assets/example/adele.png'),
  mayday_pic: require('../../assets/example/mayday.png'),
  ronghe_pic: require('../../assets/example/ronghe.png'),
};

export const getImageUri = async (key: keyof typeof IMAGE_ASSETS): Promise<string> => {
  const asset = Asset.fromModule(IMAGE_ASSETS[key]);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }
  return asset.localUri || asset.uri;
};