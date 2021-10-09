import React,{Component} from "react";
import  {View, StyleSheet, TouchableOpacity, Image, Text, SafeAreaView, StatusBar, Platform} from "react-native";
import * as Google from "expo-google-app-auth";
import firebase from "firebase";

import { RFValue } from "react-native-responsive-fontsize";

export default class LoginScreen extends Component{
    constructor(props) {
    super(props);
    this.state = {};
  }

  isUserEqual=(googleUser,firebaseUser)=>{
    if(firebaseUser){
      var providerData=firebaseUser.providerData
      for(var i=0 ; i<providerData.length ; i++){
        if(providerData[i].providerId===firebase.auth.GoogleAuthProvider.PROVIDER_ID&&
        providerData[i].uid===googleUser.getBasicProfile().getId() ){
          return true
        }
      }
    }
    return false
  };
  onSignIn=googleUser=>{
    var unsubscribe=firebase.auth().onAuthStateChanged(firebaseUser=>{
      unsubscribe()
      if(!this.isUserEqual(googleUser,firebaseUser)){
        var credential=firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        )
        firebase
        .auth()
        .signInWithCredential(credential)
        .then(function(result){
          if(result.additionalUserInfo.isNewUser){
            firebase
            .database()
            .ref("/users/"+result.user.uid)
            .set({
              gmail:result.user.email,
              profile_picture:result.additionalUserInfo.profile.picture,
              locale:result.additionalUserInfo.profile.locale,
              first_Name:result.additionalUserInfo.profile.given_Name,
              last_Name:result.additionalUserInfo.profile.family_Name,
              current_theme:"dark"
            })
            .then(function(snapshot){})
          }
        })
        .catch(error=>{
          var errorCode=error.code
          var errorMessage=error.message
          var email=error.email
          var credential=error.credential
        })
      }
      else{
        console.log("User already Signed in firebase")
      }
    })
  }
  signInWithGoogleAsync=async()=>{
    try{
      const result=await Google.logInAsync({
        behavior:"web",
        androidClientId:"724539159116-57ngrp62stv24q1b4q9hbkftpvpulfpe.apps.googleusercontent.com",
        iosClientId:"724539159116-klk0dt7o3fil6qohmp090r052purfabk.apps.googleusercontent.com",
        scopes:["profile","email"]
      })
      if(result.type==="success"){
        this.onSignIn(result)
        return result.accessToken
      }
      else{
        return{cancelled:true}
      }
    }
    catch(e){
    console.log(e.message)
    return{error:true}
    }
  } 
  render(){
    return(
      <View style={styles.container}>
        <SafeAreaView style={styles.droidSafeArea}/>
        <View style={styles.appTitle}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.iconImage}>
          ></Image>
          <Text style={styles.appTitleText}>{`Spectagram`}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
          style={styles.button}
          onPress={()=> this.signInWithGoogleAsync()}>
            <Image
              source={require("../assets/google_icon.png")}
              style={styles.googleIcon}
            ></Image>
            <Text style={styles.googleText}> Sign In with Google </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cloudConatainer}>
          <Image
            source={require('../assets/cloud.png')}
            style={styles.cloudImage}
          ></Image>  
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15193c"
  },
  droidSafeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
  },
  appTitle: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitleText: {
    color: 'white',
    textAlign: 'center',
    fontSize: RFValue(40),
  },
    button:{
    width:RFValue(250),
    height:RFValue(50),
    flexDirection:"row",
    justifyContent:"space-evenly",
    alignItems:"center",
    borderRadius:RFValue(30),
    backgroundColor:"white"
  },
  googleIcon:{
    width:RFValue(30),
    height:RFValue(30),
    resizeMode:"contain"
  },
  buttonContainer:{
    flex:0.3,
    justifyContent:"center",
    alignItems:"center"
  },
  googleText:{
    fontSize:RFValue(20),
    color:"black"
  },
  cloudImage:{
    position:"absolute",
    width:"100%",
    resizeMode:"contain",
    bottom:RFValue(-430)
  },
});