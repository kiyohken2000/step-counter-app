import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import ScreenTemplate from '../../components/ScreenTemplate'
import BlurBox from '../../components/BlurBox/BlurBox'
import { Pedometer } from 'expo-sensors';
import { fontSize } from '../../theme';

export default function Home() {
  const [todayStepCount, setTodayStepCount] = useState(0);
  const [yesterdayStepCount, setYesterdayStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status === 'granted') {
        setIsPedometerAvailable(true);
      }
    }

    requestPermissions();
  }, []);

  useEffect(() => {
    if (isPedometerAvailable) {
      console.log(Platform.OS, isPedometerAvailable)
      let yesterdaySteps = 0;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      const subscription = Pedometer.watchStepCount(result => {
        const currentStepCount = result.steps;
        console.log('currentStepCount', currentStepCount)

        if (result.startDate < startOfToday) {
          yesterdaySteps += currentStepCount;
          setYesterdayStepCount(yesterdaySteps);
        } else {
          setTodayStepCount(currentStepCount);
        }
      }, {
        startDate: startOfYesterday,
      });

      return () => subscription.remove();
    } else {
      console.log(Platform.OS, isPedometerAvailable)
    }
  }, [isPedometerAvailable]);
  
  return (
    <ScreenTemplate>
      <BlurBox>
      <View style={styles.root}>
        {isPedometerAvailable ? (
          <>
            <Text style={styles.stepCount}>今日の歩数: {todayStepCount}</Text>
            <Text style={styles.stepCount}>昨日の歩数: {yesterdayStepCount}</Text>
          </>
        ) : (
          <Text>歩数データへのアクセスが許可されていません。</Text>
        )}
      </View>
      </BlurBox>
    </ScreenTemplate>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
})
