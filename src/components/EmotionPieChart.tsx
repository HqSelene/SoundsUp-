import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Defs, RadialGradient, Stop, LinearGradient, Filter, FeGaussianBlur } from 'react-native-svg';
import { COSMIC_THEME } from '../constants/theme';

interface EmotionData {
  [key: string]: number;
}

interface EmotionPieChartProps {
  emotionData: EmotionData;
  size?: number;
}

const EmotionPieChart: React.FC<EmotionPieChartProps> = ({ emotionData, size = 200 }) => {
  const radius = size / 2 - 30;
  const centerX = size / 2;
  const centerY = size / 2;

  // 更新为浅色彩色情绪颜色映射
  const emotionColors = {
              'Calm': ['#DBEAFE', '#BFDBFE', '#93C5FD'],         // 浅蓝色系
              'Joyful': ['#E0E7FF', '#C7D2FE', '#A5B4FC'],      // 浅靛蓝色系
              'Anticipation': ['#EDE9FE', '#DDD6FE', '#C4B5FD'], // 浅紫色系
              'Excitement': ['#F3E8FF', '#E9D5FF', '#D8B4FE'],   // 浅亮紫色系
              'Energy': ['#DBEAFE', '#BFDBFE', '#93C5FD'],       // 蓝色系
              'Sadness': ['#E0F2FE', '#BAE6FD', '#7DD3FC'],      // 浅天蓝色系
              'Joy': ['#EDE9FE', '#DDD6FE', '#C4B5FD'],          // 紫色系
              'Nostalgia': ['#F1F5F9', '#E2E8F0', '#CBD5E1'],    // 浅灰蓝色系
              'Romance': ['#FDF2F8', '#FCE7F3', '#FBCFE8'],      // 浅粉紫色系
              'Tension': ['#F8FAFC', '#F1F5F9', '#E2E8F0'],      // 浅灰色系
            };

  // 计算总值
  const total = Object.values(emotionData).reduce((sum, value) => sum + value, 0);
  
  // 生成路径数据
  const generatePaths = () => {
    let currentAngle = -90; // 从顶部开始
    const paths: Array<{
      path: string;
      colors: string[];
      emotion: string;
      percentage: number;
      gradientId: string;
    }> = [];

    Object.entries(emotionData).forEach(([emotion, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      
      if (percentage < 1) return; // 忽略小于1%的数据

      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + angle) * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      paths.push({
        path: pathData,
        colors: emotionColors[emotion as keyof typeof emotionColors] || ['#F0F0F0', '#E8E8E8', '#E0E0E0'],
        emotion,
        percentage: Math.round(percentage),
        gradientId: `gradient-${index}`
      });

      currentAngle += angle;
    });

    return paths;
  };

  const paths = generatePaths();

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            {/* 轻微发光滤镜 - 减少模糊 */}
            <Filter id="lightGlow">
              <FeGaussianBlur stdDeviation="1" result="coloredBlur"/>
            </Filter>
            
            {/* 中心渐变 - 使用浅色 */}
            
            <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#2D1B69" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.5" />
            </RadialGradient>
            
            {/* 为每个扇形创建浅色渐变 */}
            {paths.map((pathData, index) => (
              <LinearGradient key={index} id={pathData.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={pathData.colors[0]} stopOpacity="0.85" />
                <Stop offset="50%" stopColor={pathData.colors[1]} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={pathData.colors[2]} stopOpacity="0.75" />
              </LinearGradient>
            ))}
          </Defs>
          
          {/* 饼状图扇形 - 移除过多的滤镜效果 */}
          {paths.map((pathData, index) => (
            <Path
              key={index}
              d={pathData.path}
              fill={`url(#${pathData.gradientId})`}
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth={1}
            />
          ))}
          
          {/* 中心圆 - 简化设计 */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.35}
            fill="url(#centerGradient)"
            stroke="rgba(108, 117, 125, 0.3)"
            strokeWidth={1}
          />
          
          {/* 中心文字 */}
          <SvgText
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            fontSize="16"
            fill="#495057"
            fontWeight="bold"
          >
            Cosmic
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            fontSize="14"
            fill="#6C757D"
            fontWeight="600"
          >
            Emotions
          </SvgText>
        </Svg>
      </View>
      
      {/* 简化的图例 */}
      <View style={styles.legendContainer}>
        {paths.map((pathData, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                { 
                  backgroundColor: pathData.colors[0],
                }
              ]} 
            />
            <Text style={styles.legendText}>
              {pathData.emotion}
            </Text>
            <Text style={styles.legendPercentage}>
              {pathData.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  chartContainer: {
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 27, 75, 0.8)', // 深紫蓝背景
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(222, 226, 230, 0.8)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(222, 226, 230, 0.5)',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(108, 117, 125, 0.3)',
  },
  legendText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
    marginRight: 4,
  },
  legendPercentage: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: 'bold',
  },
});

export default EmotionPieChart;