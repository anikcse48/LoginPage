import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert,} from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator} from '@react-navigation/stack';
import { useState } from 'react';



//initialize the database

const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing the database:", error);
  }
};



//create a stack navigator that manages the navigation between 3 screens
const stack = createStackNavigator();





//We'll have 3 screens  : Login, Register and Home


export default function App() {
  return (
    <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
      <NavigationContainer>
        <stack.Navigator initialRouteName ='Login'>
          <stack.Screen  name='Login' component={LoginScreen}/>
        <stack.Screen  name='Register' component={RegisterScreen}/>
          <stack.Screen  name='Home' component={HomeScreen}/>
        </stack.Navigator>
      </NavigationContainer>

    </SQLiteProvider>
  );
}
//LoginScreen Component
const LoginScreen = ({navigation}) =>{
 

  const db = useSQLiteContext();
  const [userName, setUserName]=useState('');
  const [password, setPassword]=useState('');

  const handleLogin = async() =>{
    if(userName.length === 0 || password.length === 0){
      Alert.alert('Attention !', 'Please enter both Username and Password');
      return;
      
    }
  
    try {
      const user = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
      if(!user){
        Alert.alert('Error', 'Username already exists.');
        return;
      }
      const validUser= await db.getFirstAsync('SELECT * FROM users WHERE username = ? AND password = ?', [userName, password]);
      if (validUser){
        Alert.alert('Success', 'Login successful ');
        navigation.navigate('Home', {user : userName});
        setUserName('');
        setPassword('');
      }else {
        Alert.alert('Error', 'Incorrect Password');
      }
    }catch(error) {
        console.log('Error during Login : ', error);
      } 
    };
  

return(
    <View style={styles.container}>
       <Text style={styles.title}>Login</Text>
       <TextInput
        style={styles.input}
        placeholder='Username'
        value={userName}
        onChangeText={setUserName}
        />

       <TextInput 
       style={styles.input}
       placeholder='Password'
       secureTextEntry
       value={password}
       onChangeText={setPassword}
       />

       <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}> Login</Text>
       </Pressable>

       <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
       </Pressable>


    </View>
  );

};

//RegisterScreen Component
const RegisterScreen = ({navigation}) =>{
  const db = useSQLiteContext();
  const [userName, setUserName]=useState('');
  const [password, setPassword]=useState('');
  const [confirmPassword, setConfirmPassword]=useState('');

  

  //Function to handel registration logic
  const handleRegister = async() =>{
    if(userName.length === 0 || password.length === 0 || confirmPassword.length === 0){
      Alert.alert('Attention !', 'Please enter all the fields');
      return;
      
    }
    if (password !==confirmPassword ){
      Alert.alert('Error', 'Password do not match');
      return;

    }
    try {
      const existingUser = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [userName]);
      if(existingUser){
        Alert.alert('Error', 'Username already exists.');
        return;
      }
      await db.runAsync('INSERT INTO users (username, password) VALUES(?, ?)', [userName, password]);
      Alert.alert('Success', 'Registartion successful!');
      navigation.navigate('Home', {user : userName});
    }catch(error) {
      console.log('Error during registration : ', error);
    }
  };

  return(
    <View style={styles.container}>
       <Text style={styles.title}>Register</Text>
       <TextInput
        style={styles.input}
        placeholder='Username'
        value={userName}
        onChangeText={setUserName}
        />

       <TextInput 
       style={styles.input}
       placeholder='Password'
       secureTextEntry
       value={password}
       onChangeText={setPassword}
       />
       <TextInput 
       style={styles.input}
       placeholder='Confirm Password'
       secureTextEntry
       value={confirmPassword}
       onChangeText={setConfirmPassword}
       />


       <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
       </Pressable>

       <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
       </Pressable>


    </View>

  );

};



//HomeScreen Component
const HomeScreen = ({navigation, route}) =>{



  //we'll extract the user parameter from routr.params

  const {user}= route.params;
  return(
    <View style={styles.container}>
       <Text style={styles.title}>Home</Text>
       <Text style={styles.userText}>Welcome {user} !</Text>
       
       <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Logout</Text>
       </Pressable>


    </View>

  );


};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,

  },
  link: {
    marginTop:10,

  },
  linkText: {
    color: 'red',
  },
  userText:{
    fontSize:18,
    marginBottom: 30,
  }
});
