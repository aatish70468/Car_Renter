import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import * as Location from 'expo-location';
import { auth, db } from '../../FirebaseConfig';
import { getDocs, collection, addDoc, query, where } from "firebase/firestore";

const CreateListing = ({ navigation }) => {
    const [vechilesList, setVechilesList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [vehicleId, setVehicleId] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [minSeat, setMinSeat] = useState('');
    const [maxSeat, setMaxSeat] = useState('');
    const [modelYear, setModelYear] = useState('');
    const [batteryCapacity, setBatteryCapacity] = useState('');
    const [licensePlate, setLicensePlate] = useState('ABC123');
    const [pickUpAddress, setPickUpAddress] = useState('160 Kendal Avenue');
    const [rentalPrice, setRentalPrice] = useState('250');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [city, setCity] = useState('');
    const [image, setImage] = useState([]);

    //Function to request location permission
    const requestLocationPermission = async () => {
        try {
            //obtain the instance of Foreground Location from the expo-location module
            const permissionObject = await Location.requestForegroundPermissionsAsync()

            if (permissionObject.status == 'granted') {
                console.log("Permission granted")
            } else {
                console.log("Permission denied")
            }
        } catch (err) {
            console.error("Permission denied", err);
        }
    }

    // Function to fetch the vehicles data from the API
    const fetchVechilesData = async () => {
        try {
            const response = await fetch('https://aatish70468.github.io/vehiclesJson/vehicles.json');
            if (!response.ok) {
                console.error(`Unsuccessful response: ${response.status}`);
            } else {
                const data = await response.json();
                console.log(`${JSON.stringify(data)}`);
                setVechilesList(data)
                // console.log(`${vechilesList[0].display_name}`);
            }
        } catch (err) {
            console.log("Error fetching vehicles data: ", err);
        }
    };

    useEffect(() => {
        console.log('first');
        fetchVechilesData()
        requestLocationPermission()
    }, []);

    // When vehicleId changes, set all the field values
    useEffect(() => {
        console.log('second');
        console.log(`Length: ${vechilesList.length}`);
        console.log(`vehicle index: ${vehicleId}`);
        if (vehicleId) {
            //const vehicle = vechilesList[vehicleId];
            setVehicleName(`${vechilesList[vehicleId].make} ${vechilesList[vehicleId].display_name}`);
            setMinSeat(`${vechilesList[vehicleId].seats_min} seats`);
            setMaxSeat(`${vechilesList[vehicleId].seats_max} seats`);
            setModelYear(`${vechilesList[vehicleId].model_year}`);
            setBatteryCapacity(`${vechilesList[vehicleId].battery_capacity}`);
            setImage(vechilesList[vehicleId].images)
        }
    }, [vehicleId]);

    useEffect(() => {
        console.log('third');
        getCordsFromAddress();
    }, [pickUpAddress])

    useEffect(() => {
        console.log('fourth');
        getAddressFromCoords();
    }, [latitude, longitude])

    const setVehilesListToPicker = () => {
        if (vechilesList) {
            return vechilesList.map((vehicle, vehicleIndex) => (
                <Picker.Item key={vehicleIndex} label={`${vehicle.make} ${vehicle.display_name}`} value={vehicleIndex} />
            ));
        }
    };

    const getVehicleDataFromList = () => {
        if (vehicleId) {
            return (
                <View>
                    <Text>Vehicle Information</Text>
                    <Text>Name:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Vehicle Name"
                        onChangeText={text => setVehicleName(text)}
                        value={vehicleName}
                        editable={false}
                    />
                    <Text>Minimum Seating Capacity:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Minimum Seating Capacity"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onChangeText={text => setMinSeat(text)}
                        value={minSeat}
                    />
                    <Text>Maximum Seating Capacity:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Maximum Seating Capacity"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onChangeText={text => setMaxSeat(text)}
                        value={maxSeat}
                    />
                    <Text>Model Year:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Model Year"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onChangeText={text => setModelYear(text)}
                        value={modelYear}
                    />
                    <Text>Battery Capacity:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Battery Capacity"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onChangeText={text => setBatteryCapacity(text)}
                        value={batteryCapacity}
                    />
                </View>
            );
        }
        return null;
    };

    // Function for location to setup lat, lng
    const getCordsFromAddress = async () => {
        try {
            const getcodedLocation = await Location.geocodeAsync(pickUpAddress);
            if (getcodedLocation.length > 0 && getcodedLocation[0].latitude && getcodedLocation[0].longitude) {
                const result = getcodedLocation[0];
                console.log(`${result.latitude}, ${result.longitude}`);
                setLatitude(result.latitude);
                setLongitude(result.longitude);
            }
        } catch (err) {
            console.log("Error getting location: ", err);
        }
    };

    const getAddressFromCoords = async () => {
        try {
            const coords = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };
            const postalAddressList = await Location.reverseGeocodeAsync(coords, {});
            if (postalAddressList.length > 0) {
                const result = postalAddressList[0];
                console.log(JSON.stringify(result));
                setCity(result.district);
            }
        } catch (err) {
            console.log("Error getting location from coordinates: ", err);
        }
    };

    const btnAddListingPressed = async () => {
        try {
            await getCordsFromAddress();
            await getAddressFromCoords();
            if (longitude && latitude && city) {
                const dataToSave = {
                    ownerId: auth.currentUser.uid,
                    vehicleName: vehicleName,
                    minSeat: minSeat,
                    maxSeat: maxSeat,
                    modelYear: modelYear,
                    batteryCapacity: batteryCapacity,
                    licensePlate: licensePlate,
                    pickUpAddress: pickUpAddress,
                    rentalPrice: rentalPrice,
                    latitude: latitude,
                    longitude: longitude,
                    city: city,
                    image: image
                };

                const listingCollectionRef = collection(db, "listings");
                const listingQuery = query(listingCollectionRef, where('licensePlate', '==', dataToSave.licensePlate));

                const getListing = await getDocs(listingQuery);
                if (getListing.docs.length > 0) {
                    alert("Listing already exists");
                } else {
                    const docRef = await addDoc(listingCollectionRef, dataToSave);
                    console.log("Document written with ID: ", docRef.id);
                    navigation.navigate('Manage Booking');
                }
            } else {
                alert(`Unable to create listing because we didn't find longitude, latitude or city.`)
            }
        } catch (err) {
            console.log("Error creating listing: ", err);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Picker
                    selectedValue={vehicleId}
                    onValueChange={(itemValue) => setVehicleId(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {setVehilesListToPicker()}
                </Picker>
                <View>
                    {getVehicleDataFromList()}
                </View>
                <Text>License Plate:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="License Plate"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onChangeText={text => setLicensePlate(text)}
                    value={licensePlate}
                />
                <Text>Pickup Location Address:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Pickup Location Address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onChangeText={text => setPickUpAddress(text)}
                    value={pickUpAddress}
                />
                <Text>Rental Price for a week:</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Rental Price"
                    onChangeText={text => setRentalPrice(text)}
                    value={rentalPrice}
                />
                <TouchableOpacity style={styles.button} onPress={btnAddListingPressed}>
                    <Text style={styles.buttonText}>Add Listing</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateListing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    scrollView: {
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 5,
    },
    textInput: {
        height: 50,
        borderColor: '#bdc3c7',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        backgroundColor: '#fff',
        borderColor: '#bdc3c7',
        borderWidth: 1,
        borderRadius: 8,
    },
    pickerItem: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    map: {
        flex: 1,
        minHeight: 300,
        marginBottom: 20,
    },
    searchBar: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    markerContainer: {
        backgroundColor: '#3498db',
        padding: 8,
        borderRadius: 20,
    },
    markerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2c3e50',
    },
    modalDescription: {
        fontSize: 16,
        color: '#34495e',
        marginBottom: 15,
    },
    imageContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    image: {
        width: 120,
        height: 90,
        borderRadius: 8,
        marginRight: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
});