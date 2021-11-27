import React from 'react'
import { View, Text, Image, StyleSheet, ImageBackground } from "react-native";

const index=(props)=> {
    const {name, image, bio} = props.user;



    const styles = StyleSheet.create({
        pageContainer: {justifyContent:'center', alignItems:'center', flex:1},
        image: {width: '100%', height:'100%', borderRadius:10, overflow:"hidden", justifyContent:'flex-end'},//justifyContent:'flex-end' for name at bottom end
        card: {width: '100%', height: '100%', shadowColor:'#000', backgroundColor:'#fefefe',
              shadowColor:'#000', shadowOffset:{width:0, height:5}, shadowOpacity:1, shadowRadius: 6.68, elevation:11,
              },
        name: {fontSize:30, color:'white', fontWeight:'bold', },
        bio: {fontSize:18, color:'white', lineHeight:25,},
        cardInner: {padding:10,}
      })
      
    return (
        <View style={styles.card}>
          <ImageBackground
          source={{
            uri: image
          }}
          style={styles.image}
          >
          <View style={styles.cardInner}>      
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.bio}>{bio}</Text>
          </View>
          </ImageBackground>
          
    </View>
    )
}

export default index
