import React, {useEffect, useState} from "react";
import { View, Text, Image, StyleSheet, ImageBackground, Pressable, useWindowDimensions, SafeAreaView } from "react-native";

import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import HomeScreen from "./src/screens/HomeScreen";
import MatchesScreen from "./src/screens/MatchesScreen";

import Amplify, {Hub} from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native'
import config from './src/aws-exports'
import ProfileScreen from "./src/screens/ProfileScreen";
Amplify.configure({...config, Analytics:{disabled: true,}}) //destructure everything from config, turn off the analytics to stop warning

const App = ()=> {
  const [activeScreen, setActiveScreen] = useState('HOME');

  const color = '#b5b5b5';
  const activeColor = '#F76C6B';
  // const onSwipeLeft = (user)=> {
  //   console.warn('swipe left', user.name)
  // }

  // const onSwipeRight = (user)=> {
  //   console.warn('swipe right:', user.name)
  // }

  const styles = StyleSheet.create({
    pageContainer: {justifyContent:'center', alignItems:'center', flex:1},
    root: {flex:1},
    topNavigation: {flexDirection:'row', justifyContent:'space-around', width:'100%', padding:10, paddingTop:35,},


  })


  useEffect(() => {
    //create listener: we r listening the modelSynced
    const listener = Hub.listen('datastore', async hubData => {
      const {event, data} = hubData.payload;
      if (event === 'modelSynced' && data?.model?.name === 'User') {
        console.log(`Model has finished syncing`) //we get specific event when certain model has finished syncing
      } //right now we know we can safly query the users as the same as our database
    }); //for critical situation like if we duplicate the data

    return () => listener();
  }, []);


  return (
    <SafeAreaView style={styles.root}>
    <View style={styles.pageContainer}>
        <View style={styles.topNavigation}>
          <Pressable onPress={()=> setActiveScreen("HOME")}>
            <Fontisto name="tinder" size={30} color={activeScreen === 'HOME' ? activeColor : color} />
          </Pressable>
        
        <MaterialCommunityIcons name="star-four-points" size={30} color={color} />
          <Pressable onPress={()=> setActiveScreen("CHAT")}>
            <Ionicons name="ios-chatbubbles" size={30} color={activeScreen === 'CHAT' ? activeColor : color} />
          </Pressable>

          <Pressable onPress={()=> setActiveScreen("PROFILE")}>
          <FontAwesome name="user" size={30} color={activeScreen === 'PROFILE' ? activeColor : color} />
          </Pressable>
        </View>
      {activeScreen === 'HOME' && <HomeScreen/>}
      {activeScreen === 'CHAT' && <MatchesScreen/>}
      {activeScreen === 'PROFILE' && <ProfileScreen/>}
      {/* <MatchesScreen/> */}
    </View>
    </SafeAreaView>

      
    );

};

//resizeMode='contain', the image will in a way fully
//zindex in android is not working need to use elevation
//for likeStyle to work, need to add Animated.Image to Image

export default withAuthenticator(App);