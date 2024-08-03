import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { auth, db } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo vector icons
import { Picker } from "@react-native-picker/picker";

const SignIn = ({ navigation }) => {
    const [email, setEmail] = useState('b@gmail.com');
    const [password, setPassword] = useState('bbbbbb');
    const [userType, setUserType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const btnSignInPressed = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const userCollectionRef = collection(db, "users");
            const userQuery = query(userCollectionRef, where('id', '==', userId), where('userType', '==', userType));

            const getUser = await getDocs(userQuery);
            if (getUser.docs.length > 0) {
                console.log(`User is a ${userType}: ${getUser.docs.length}`);

                if (userType === 'Renter') {
                    navigation.replace('Renter Home');
                } else if (userType === 'Owner') {
                    navigation.replace('Owner Home');
                } else {
                    alert('Invalid user type');
                }

            } else {
                alert('Invalid user type');
            }
        } catch (error) {
            console.log('Error signing in:', error.message);
            setErrorMessage(error.message);
        }
    };

    const btnSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={24} color="#007bff" style={styles.icon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter email"
                            placeholderTextColor="#999"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onChangeText={text => setEmail(text)}
                            value={email}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={24} color="#007bff" style={styles.icon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder='Enter password'
                            placeholderTextColor="#999"
                            textContentType="password"
                            autoCapitalize="none"
                            returnKeyType="done"
                            secureTextEntry={true}
                            onChangeText={text => setPassword(text)}
                            value={password}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={24} color="#007bff" style={styles.pickerIcon} />
                        <Picker
                            selectedValue={userType}
                            style={styles.textInput}
                            onValueChange={(itemValue, itemIndex) => setUserType(itemValue)}>
                            <Picker.Item label="Select User Type" value="" />
                            <Picker.Item label="Renter" value="Renter" />
                            <Picker.Item label="Owner" value="Owner" />
                        </Picker>
                    </View>

                    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={btnSignInPressed}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signUpButton} onPress={btnSignUpPressed}>
                        <Text style={styles.signUpButtonText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 10,
    },
    pickerIcon: {
        marginRight: -5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    button: {
        height: 50,
        width: '100%',
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signUpButton: {
        marginTop: 10,
    },
    signUpButtonText: {
        color: '#007bff',
        fontSize: 16,
    },
    error: {
        color: '#e74c3c',
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    }
});