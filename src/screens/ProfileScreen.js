import React, {useState, useEffect} from 'react'
import { View, Text, StyleSheet, SafeAreaView, Image, Pressable, TextInput, Alert } from 'react-native'
import users from '../../TinderAssets/assets/data/users'
import { Auth, DataStore} from 'aws-amplify'
import { Picker } from '@react-native-picker/picker'
import {User} from '../models/';

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState();
    const [lookingFor, setLookingFor] = useState();

    useEffect(()=>{
        const getCurrentUser = async () => {
            const authUser = await Auth.currentAuthenticatedUser();

            const dbUsers = await DataStore.query(User, u => u.sub('eq', authUser.attributes.sub)); //User is from AWS table we created

            if(!dbUsers || dbUsers.length === 0){
                return;
            }
            const dbUser = dbUsers[0]; //user is the first user, using query is an array
            setUser(dbUser);

            setName(dbUser.name);
            setBio(dbUser.bio);
            setGender(dbUser.gender);
            setLookingFor(dbUser.lookingFor);
            //the information will remain in the app when we enter
            console.warn(dbUsers);
        };
        getCurrentUser();
    }, []);

    const isValid =()=>{
        return name && bio && gender && lookingFor; //all of these are not null, then is valid
    };



    const save = async () => {
        if(!isValid()) {
            console.warn('Not Valid')
            return;
        }

        if (user) {

            const updatedUser = User.copyOf(user, updated=>{
                //if (user) means if user existed in database
                updated.name = name;
                updated.bio = bio;
                updated.gender = gender;
                updated.lookingFor = lookingFor;
            });


            await DataStore.save(updatedUser);
        } else {
            //create a new user
            const authUser = await Auth.currentAuthenticatedUser();
            //console.log(user); //will reveal user data
    
            
            const newUser = new User({
                sub: authUser.attributes.sub, //wanted to update user info instead of creating new
                name,
                bio,
                gender,
                lookingFor,
                image:'https://static.straitstimes.com.sg/s3fs-public/styles/article_pictrure_780x520_/public/articles/2020/01/19/yq-edi-19012020.jpg?itok=ZH0Aut9P&timestamp=1579425665'
            });
                await DataStore.save(newUser)
        }

       Alert.alert('User saved successfully');
    };

    const signOut = async () => {
        await DataStore.clear();
        Auth.signOut();
    };

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.container}>

                <TextInput style={styles.input} placeholder='name...' value={name} onChangeText={setName}/>
                <TextInput style={styles.input} placeholder='bio...' multiline numberofLines={3} value={bio} onChangeText={setBio}/>

                <Text>Gender</Text>

                <Picker
                label='Gender'
                selectedValue={gender}
                onValueChange={(itemValue) =>
                    setGender(itemValue)
                }>
                {/* the three value needs to match with AWS backend */}
                <Picker.Item label="Male" value="MALE" /> 
                <Picker.Item label="Female" value="FEMALE" />
                <Picker.Item label="Other" value="OTHER" />
                </Picker>
                
                <Text>Looking for</Text>

                <Picker
                label='Looking for'
                selectedValue={lookingFor}
                onValueChange={(itemValue) =>
                    setLookingFor(itemValue)
                }>
                <Picker.Item label="Male" value="MALE" />
                <Picker.Item label="Female" value="FEMALE" />
                <Picker.Item label="Other" value="OTHER" />
                </Picker>
                
                <Pressable onPress = {save} style={styles.button}>
                    <Text>Save</Text>
                </Pressable>

                <Pressable onPress = {signOut} style={styles.button}>
                    <Text>Sign out</Text>
                </Pressable>
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
    input:{
        margin:10,
        borderBottomColor:'lightgray',
        borderBottomWidth:1,
    },
    button:{
        backgroundColor:'#F63A6E',
        height:25,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:20,
        margin:10,
    }

})

export default ProfileScreen
