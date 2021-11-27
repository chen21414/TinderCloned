import React, {useEffect, useState} from "react";
import { View, Text, Image, StyleSheet, ImageBackground, Pressable, useWindowDimensions } from "react-native";
import Card from '../components/Tindercard/index'
import users from '../../TinderAssets/assets/data/users'
import 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useAnimatedGestureHandler, event, useDerivedValue, interpolate, runOnJS } from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import Like from '../../TinderAssets/assets/images/LIKE.png'
import Nope from '../../TinderAssets/assets/images/nope.png'
import AnimatedStack from "../components/AnimatedStack/index";

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Auth, DataStore} from 'aws-amplify';
import {User, Match} from '../models/';

const HomeScreen = ()=> {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(()=>{
    const getCurrentUser = async () => {
        const user = await Auth.currentAuthenticatedUser();

        const dbUsers = await DataStore.query(User, u => u.sub === user.attributes.sub); //User is from AWS table we created

        if(dbUsers.length < 0){
            return;
        }
        setMe(dbUsers[0]); //user is the first user, using query is an array
        
    };
    getCurrentUser();
}, []);

  useEffect(()=>{
    const fetchUsers = async () => {
      const fetchedUsers = await DataStore.query(User);
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  const onSwipeLeft = ()=> {
    if(!currentUser || !me) {
      return; //if not currentUser: do nothing. w/o this will cause error
    }
    
    //console.warn('swipe left', currentUser.name)
  }

  const onSwipeRight = async ()=> {
        if(!currentUser || !me) {
          return;
        }

        const myMatches = await DataStore.query(Match, match => (
          match.user1ID('eq', me.id).user2ID('eq', currentUser.id)
        ));
        if(myMatches.length > 0) {
          //if swipe right, don't need to wait
          console.warn('you already swiped right to this user');
          return;
        }

        const hisMatches = await DataStore.query(Match, match => (
          match.user1ID('eq', currentUser.id).user2ID('eq', me.id)
        ));
        console.log('hisMatches');
        console.log("User1", currentUser.id);
        console.log("User2", me.id);
        
        if(hisMatches.length > 0) {
          //if swipe right, don't need to wait
          console.warn('yay, this is a new match');
          const hisMatch = hisMatches[0];
          DataStore.save(
            Match.copyOf(hisMatch, updated => (updated.isMatch = true))
            );
            return; 
        }
        console.warn('Sending him a match request!');
        DataStore.save(new Match({
          user1ID: me.id,
          user2ID: currentUser.id,
          isMatch: true,


        }),
        );
        //console.warn('swipe right:', currentUser.name)
  };

  const styles = StyleSheet.create({
    pageContainer: {justifyContent:'center', alignItems:'center', flex:1, width:'100%',backgroundColor:'#ededed'},
    icons:{flexDirection:'row', justifyContent:'space-around', width:'100%', padding: 10, paddingBottom:25,},
    button:{backgroundColor:'white', padding:7, borderRadius: 50, width:50, height:50, justifyContent:'center', alignItems:'center',}

  })



  return (
    
    <View style={styles.pageContainer}>
      <AnimatedStack
        data={users}
        renderItem ={ (({item}) => <Card user={item} /> ) } //renderItem is a function we will receive an item, and it will render a card for us
        setCurrentUser={setCurrentUser}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
       />
       <View style={styles.icons}>
         <View style={styles.button}>
          <FontAwesome name="undo" size={30} color="#FBD88B" />
         </View>

         <View style={styles.button}>
          <Entypo name="cross" size={30} color="#F76C6B" />
        </View>

        <View style={styles.button}>
          <FontAwesome name="star" size={30} color="#3AB4CC" />
        </View>

        <View style={styles.button}>
        < FontAwesome name="heart" size={30} color="#4FCC94" />
        </View>

        <View style={styles.button}>
          <Ionicons name="flash" size={30} color="#A65CD2" />
        </View>
        
       </View>
    </View>

      
    );

};

//resizeMode='contain', the image will in a way fully
//zindex in android is not working need to use elevation
//for likeStyle to work, need to add Animated.Image to Image

export default HomeScreen