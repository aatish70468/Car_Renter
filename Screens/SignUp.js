import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { auth, db, storage } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cnfPassword, setCnfPassword] = useState('');
    const [name, setName] = useState('');
    const [userType, setUserType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [imageFromGallery, setImageFromGallery] = useState('');
    const [profileImagePath, setProfileImagePath] = useState('');

    useEffect(() => {
        savePhotoToStorage();
    }, [imageFromGallery])

    const chooseProfileImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })

            if (!result.canceled) {
                setImageFromGallery(result.assets[0].uri);
                savePhotoToStorage();
            } else {
                console.log('User cancelled image selection');
                return;
            }
        } catch (err) {
            console.log('Error launching camera: ', err);
        }
    }

    const savePhotoToStorage = async () => {
        try {
            const filename = imageFromGallery.substring(imageFromGallery.lastIndexOf('/') + 1, imageFromGallery.length)
            const storageRef = ref(storage, filename)
            const response = await fetch(imageFromGallery)
            const blobFile = await response.blob()

            await uploadBytesResumable(storageRef, blobFile).then(async (snapshot) => {
                console.log('Upload complete', snapshot.ref.fullPath);
            })
            setErrorMessage('');
            getDownloadProfileURL();
        } catch (err) {
            console.error('Error uploading image: ', err);
            setErrorMessage(err.message);
        }
    }

    const getDownloadProfileURL = async () => {
        const filename = imageFromGallery.substring(imageFromGallery.lastIndexOf('/') + 1, imageFromGallery.length)
        const storageRef = ref(storage, filename)

        await getDownloadURL(storageRef).then((url) => {
            console.log(`Picture URL: ${url}`)
            setProfileImagePath(url)
            alert('Profile image uploaded successfully.')
        }).catch((err) => {
            console.error(`Error getting image from firebase storage: ${err}`)
        })
    }

    const btnCreateAccountPressed = async () => {
        try {
            if (password !== cnfPassword) {
                setErrorMessage('Passwords do not match');
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const userCollectionRef = collection(db, 'users');
            const userDocRef = doc(userCollectionRef, userId);

            const addUserData = {
                name: name,
                email: email,
                id: userId,
                userType: userType,
                profileImagePath: profileImagePath
            };

            await setDoc(userDocRef, addUserData);
            console.log(`User signed in successfully with id: ${userId}`);

            if (userType === 'Renter') {
                navigation.replace('Renter Home');
            } else if (userType === 'Owner') {
                navigation.replace('Owner Home');
            }

            setErrorMessage('');
        } catch (error) {
            console.log(`Error signing in: ${error}`);
            setErrorMessage(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <Text style={styles.prompts}>Email:</Text>
            <TextInput
                style={styles.textInput}
                placeholder="Enter email"
                textContentType="emailAddress"
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={text => setEmail(text)}
                value={email}
            />

            <Text style={styles.prompts}>Name:</Text>
            <TextInput
                style={styles.textInput}
                placeholder="Enter name"
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={text => setName(text)}
                value={name}
            />

            <Text style={styles.prompts}>Password:</Text>
            <TextInput
                style={styles.textInput}
                placeholder='Enter password'
                textContentType="password"
                autoCapitalize="none"
                returnKeyType="next"
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
                value={password}
            />

            <Text style={styles.prompts}>Confirm Password:</Text>
            <TextInput
                style={styles.textInput}
                placeholder='Confirm password'
                textContentType="password"
                autoCapitalize="none"
                returnKeyType="done"
                secureTextEntry={true}
                onChangeText={text => setCnfPassword(text)}
                value={cnfPassword}
            />

            <Text style={styles.prompts}>User Type:</Text>
            <View style={styles.textInput}>
                <Picker
                    selectedValue={userType}
                    style={{ height: 50, width: '100%', marginLeft: -18, marginTop: -3 }}
                    onValueChange={(itemValue, itemIndex) => setUserType(itemValue)}>
                    <Picker.Item label="Renter" value="renter" />
                    <Picker.Item label="Owner" value="owner" />
                </Picker>
            </View>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={chooseProfileImage}>
                <Text style={styles.buttonText}>Pick Profile Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={btnCreateAccountPressed}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 30,
        textAlign: 'center',
    },
    prompts: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#2c3e50',
        borderWidth: 1,
        borderColor: '#bdc3c7',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    error: {
        color: '#e74c3c',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    }
});