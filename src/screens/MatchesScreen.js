import { DataStore, Auth } from '@aws-amplify/datastore';
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native'
import users from '../../TinderAssets/assets/data/users'
import {Match, User} from '../models';

const MatchesScreen = () => {
    const [matches, setMatches] = useState([]);
    const [me, setMe] = useState(null);

    const getCurrentUser = async () => {
        const user = await Auth.currentAuthenticatedUser();

        const dbUsers = await DataStore.query(User, u => u.sub === user.attributes.sub); //User is from AWS table we created, u means updated (self declared)

        if(dbUsers.length < 0){
            return;
        }
        setMe(dbUsers[0]); //user is the first user, using query is an array
        
    };

    useEffect(() => {
        getCurrentUser()
    
    }, [])

    useEffect(() => {
        if(!me){
            return;
        }

        const fetchMatches = async () => {
            const result = await DataStore.query(Match, m => 
                m.isMatch('eq', true)
                .or(m => m.user1ID('eq', me.id).user2ID('eq', me.id)),
                );
            setMatches(result);
            console.warn(result);
        };
        fetchMatches();
    }, [me]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>
            <Text style={{fontWeight:'bold', fontSize:24, color: '#F63A6E'}}>New Matches</Text>
            </View>
            <View style={styles.users}>
            {matches.map(match => (
                <View style={styles.user} key={match.user1.id}>
                    <Image source={{uri: match.user1.image}} style={styles.image}/>
                </View>
            ))}
            </View>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    root:{
        width:'100%',
        flex:1,
        padding:10,

    },
    container:{
        padding:10,
    },
    image:{
        width:'100%',
        height:'100%',
        borderRadius:50,

    },
    user:{
        width:100,
        height:100,
        margin: 10,
        borderRadius:50,

        borderWidth:2,
        padding:3,
        borderColor:'#F63A6E'

    },
    users:{
        flexDirection:'row',
        flexWrap:'wrap',

    }
})

export default MatchesScreen
