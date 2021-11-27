import React, {useEffect, useState} from "react";
import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useAnimatedGestureHandler, event, useDerivedValue, interpolate, runOnJS } from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import Like from '../../../TinderAssets/assets/images/LIKE.png'
import Nope from '../../../TinderAssets/assets/images/nope.png'


const ROTATION = 60; //maxium rotation
const SWIPE_VELOCITY = 800;

const AnimatedStack = (props)=> {
  const {data, renderItem, onSwipeRight, onSwipeLeft, setCurrentUser} = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(currentIndex+ 1);

  const currentProfile = data[currentIndex];
  const nextProfile = data[nextIndex];

  const {width:screenWidth} = useWindowDimensions();

  const hiddenTranslateX = 2 * screenWidth; //more smooth

  const translateX = useSharedValue(0); //animation use, -width 0 width (input range)
  const rotate = useDerivedValue( //This hook allows for creating shared value reference that can change in response to updating of one or more other shared values.
    ()=> interpolate(
    translateX.value,
    [0, hiddenTranslateX],
    [0, ROTATION],
  ) + 'deg'); //-60 - 0 - 60 degs (output range)
 
  const cardStyle = useAnimatedStyle(() => ({
    transform:[{
      translateX:translateX.value,
      //adding withSpring on top makes animation smooth
    },
    {
      rotate:rotate.value

    }
  ],

  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform:[
      {scale: interpolate(
        translateX.value,
        [-hiddenTranslateX, 0, hiddenTranslateX],
        [1, 0.8, 1] //whenever it's -hiddenTranslateX, the scale is full size 1; otherwise 0.8 size
      )} 
  ],
    opacity: interpolate(
      translateX.value,
      [-hiddenTranslateX, 0, hiddenTranslateX],
      [1, 0.6, 1],
      
    )
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, hiddenTranslateX / 10], // %10 to get the opacity showing more faster
      [0, 1],
    )
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -hiddenTranslateX / 10],
      [0, 1],
    )
  }));


  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value //start point

      //console.warn('Touch Start');
    },
    onActive: (event, context)=>{
      translateX.value = context.startX + event.translationX;
      //console.log('Touch x:', event.translationX);
    },
    onEnd: (event)=>{
      if(Math.abs(event.velocityX) < SWIPE_VELOCITY){
        translateX.value = withSpring(0);

        return; //ends here
      }
      //console.warn('Touch end:');

      //translateX.value = withSpring(event.velocityX > 0 ? hiddenTranslateX : -hiddenTranslateX); //want to throw it away to hiddenTranslateX
    
      translateX.value = withSpring(hiddenTranslateX * Math.sign(event.velocityX), {}, ()=> {
        runOnJS(setCurrentIndex)(currentIndex + 1);//run this on js; when swipe out current photo

      }); //the callback means when animation finished

      //not sure what are these for, 3:30:00
      const onSwipe = event.velocityX > 0 ? onSwipeRight : onSwipeLeft;
      onSwipe && runOnJS(onSwipe)(); //onSwipe && means if function is not null
    },
  });

  useEffect(()=>{
    translateX.value = 0;
    setNextIndex(currentIndex + 1);
  }, [currentIndex, translateX]) //everytime currentIndex is changed

  useEffect(()=>{
    setCurrentUser(currentProfile);
  }, [currentProfile, setCurrentUser])

  // const Mike = {
  //   name: 'Mike Chen',
  //   bio: 'RocketShip looking for fuel',
  //   image: 'https://static.straitstimes.com.sg/s3fs-public/styles/article_pictrure_780x520_/public/articles/2020/01/19/yq-edi-19012020.jpg?itok=ZH0Aut9P&timestamp=1579425665'
  // }


  const styles = StyleSheet.create({
    root: {justifyContent:'center', alignItems:'center', flex:1, width:'100%'},
    animatedCard: {width:'90%', height: '70%', justifyContent:'center', alignItems:'center',},
    nextCardContainer:{...StyleSheet.absoluteFillObject, justifyContent:'center', alignItems:'center',},
    Like: {width:150, height:150, position:'absolute', top:10, zIndex:999,elevation:999}
  })



  return (
    // root changed from pageContainer
    <View style={styles.root}> 
      {nextProfile && //if nextProfile, do the following
      (<View style={styles.nextCardContainer}>
        <Animated.View style={[styles.animatedCard, nextCardStyle]}>
        {renderItem({item: nextProfile})}
        </Animated.View>
        </View>)
      }

      {/* if currentProfile is not null, render currentProfile */}
      {currentProfile ?
      (<PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.animatedCard, cardStyle]}>
      <Animated.Image source={Like} style={[likeStyle, styles.Like, {left: 10}]} resizeMode='contain' /> 
      <Animated.Image source={Nope} style={[nopeStyle, styles.Like, {right: 10}]} resizeMode='contain' />
      {renderItem({item: currentProfile})}
      </Animated.View>
      </PanGestureHandler>) : (
        <View>
            <Text>No More Users Found</Text>
        </View>
      )
      }
    </View>

      
    );

};

//resizeMode='contain', the image will in a way fully
//zindex in android is not working need to use elevation
//for likeStyle to work, need to add Animated.Image to Image

export default AnimatedStack
