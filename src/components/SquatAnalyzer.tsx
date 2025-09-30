import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Landmark, calculateAngle } from '../utils/angleUtils';

const POSE_HTML = require('../../assets/pose.html');

const SquatAnalyzer: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('等待检测中...');
  const [repCount, setRepCount] = useState<number>(0);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [prevKneeAngle, setPrevKneeAngle] = useState<number | null>(null);
  const webViewRef = useRef<WebView>(null);
  const lastRepTime = useRef<number>(0);

  // 根据FMS标准分析深蹲动作
  useEffect(() => {
    if (!landmarks || !isAnalyzing) {
      if (!isAnalyzing) {
        setFeedback('分析已停止');
      } else {
        setFeedback('等待检测中...');
      }
      return;
    }

    try {
      // MediaPipe Pose关键点索引:
      // 0: 鼻子, 11: 左肩, 12: 右肩, 23: 左髋, 24: 右髋
      // 25: 左膝, 26: 右膝, 27: 左踝, 28: 右踝

      // 使用左侧身体关键点进行分析（也可以使用右侧）
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];
      const leftAnkle = landmarks[27];
      const leftShoulder = landmarks[11];

      // 检查关键点是否都存在
      if (!leftHip || !leftKnee || !leftAnkle || !leftShoulder) {
        setFeedback('身体关键点检测不完整');
        return;
      }

      // 计算膝关节角度 (髋-膝-踝)
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      
      // 计算躯干前倾角度 (肩-髋连线与垂直方向的夹角)
      const trunkAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y - 1, z: 0 }, // 垂直向上的参考点
        leftShoulder,
        leftHip
      );

      // 深蹲计数逻辑
      const now = Date.now();
      if (prevKneeAngle !== null && now - lastRepTime.current > 1000) {
        // 检测深蹲过渡: 站立 -> 下蹲 -> 站立
        if (prevKneeAngle > 160 && kneeAngle < 100) {
          // 过渡到下蹲位置
          lastRepTime.current = now;
        } else if (prevKneeAngle < 100 && kneeAngle > 160) {
          // 回到站立位置 - 计数一次深蹲
          setRepCount(prev => prev + 1);
          lastRepTime.current = now;
        }
      }
      
      setPrevKneeAngle(kneeAngle);

      // 根据FMS标准进行评估
      if (kneeAngle < 70) {
        setFeedback('膝盖弯曲过度');
      } else if (kneeAngle > 140) {
        setFeedback('蹲得不够低');
      } else if (trunkAngle > 30) {
        setFeedback('背部前倾过多');
      } else {
        setFeedback('动作标准');
      }
    } catch (error) {
      setFeedback('分析过程中出现错误');
      console.error('Error analyzing pose:', error);
    }
  }, [landmarks, isAnalyzing, prevKneeAngle]);

  // 处理从WebView接收到的消息
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (Array.isArray(data)) {
        setLandmarks(data as Landmark[]);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const toggleAnalysis = () => {
    setIsAnalyzing(!isAnalyzing);
    if (!isAnalyzing) {
      setFeedback('开始分析...');
    } else {
      setFeedback('分析已停止');
    }
  };

  const resetAnalysis = () => {
    setRepCount(0);
    setFeedback('等待检测中...');
    setPrevKneeAngle(null);
    lastRepTime.current = 0;
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={POSE_HTML}
        style={styles.webViewContainer}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedback}</Text>
        <Text style={styles.repCountText}>次数: {repCount}</Text>
      </View>
      
      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isAnalyzing ? styles.stopButton : styles.startButton]}
          onPress={toggleAnalysis}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? '停止分析' : '开始分析'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetAnalysis}
        >
          <Text style={styles.buttonText}>重置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  repCountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SquatAnalyzer;