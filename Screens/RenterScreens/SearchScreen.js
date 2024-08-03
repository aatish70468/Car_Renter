import { React, useState, useEffect, useRef } from "react"
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, Modal, ScrollView, TextInput } from "react-native"
import MapView, { Callout, CalloutSubview, Marker } from "react-native-maps"
import * as Location from "expo-location"
import { auth, db } from "../../FirebaseConfig"
import { collection, getDocs, query, where } from "firebase/firestore"
import Ionicons from 'react-native-vector-icons/Ionicons'

const SearchScreen = ({ navigation }) => {

    const [listingsList, setListingsList] = useState([]);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [selectedListing, setSelectedListing] = useState(null);
    const [ownerName, setOwnerName] = useState("");
    const [city, setCity] = useState("");

    const defaultLocation = {
        coords: {
            latitude: 43.6425891636011,
            longitude: -79.387049280787,
        },
    };

    const defaultRegion = {
        latitude: 43.6425891636011,
        longitude: -79.387049280787,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    const [currLocation, setCurrLocation] = useState(defaultLocation);

    const mapRef = useRef(null);

    useEffect(() => {
        requestLocationPermission();
        getCurrentLocation();
    }, []);

    useEffect(() => {
        getOwnerName();
    }, [selectedListing]);

    useEffect(() => {
        getCurrentCity();
        getListingFromDB();
    }, [currLocation]);

    useEffect(() => {
        forwardGeocoding();
        getListingFromDB();
    }, [city]);

    const getOwnerName = async () => {
        try {
            if (selectedListing) {
                const ownerId = selectedListing.listing.ownerId;
                const collectionRef = collection(db, "users");
                const nameQuery = query(collectionRef, where("id", "==", ownerId));
                const querySnapshot = await getDocs(nameQuery);

                if (querySnapshot.docs.length > 0) {
                    setOwnerName(querySnapshot.docs[0].data().name);
                } else {
                    setOwnerName("");
                }
            }
        } catch (err) {
            console.log("Error fetching owner name", err);
        }
    }

    const requestLocationPermission = async () => {
        try {
            const permissionObject = await Location.requestForegroundPermissionsAsync();
            if (permissionObject.status === "granted") {
                getCurrentLocation();
            } else {
                console.log("Permission Denied");
            }
        } catch (err) {
            console.log("Permission Denied", err);
        }
    }

    const getCurrentLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            if (location) {
                setLatitude(location.coords.latitude);
                setLongitude(location.coords.longitude);
                setCurrLocation(location);

                const mapRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };

                if (mapRef.current) {
                    mapRef.current.animateToRegion(mapRegion);
                }
            } else {
                alert("Unable to get current location");
            }
        } catch (err) {
            console.log("Error getting location: ", err);
            alert("Unable to get location");
        }
    }

    //get current city of the user based on user current location
    const getCurrentCity = async () => {
        //console.log(`Current City: ${latitude}, ${longitude}`);
        try {
            const coords = {
                latitude: latitude,
                longitude: longitude,
            };
            const postalAddressList = await Location.reverseGeocodeAsync(coords, {});
            if (postalAddressList.length > 0) {
                const result = postalAddressList[0];
                setCity(result.district);
            }
        } catch (err) {
            console.log("Error getting location from coordinates: ", err);
        }
    }

    //forward geocoding
    const forwardGeocoding = async () => {
        try {
            const geocodeResponse = await Location.geocodeAsync(city);
            if (geocodeResponse.length > 0) {
                const location = geocodeResponse[0];
                setLatitude(location.latitude);
                setLongitude(location.longitude);
                const mapRegion = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };
                if (mapRef.current) {
                    mapRef.current.animateToRegion(mapRegion);
                }
                //getListingFromDB();
            }
        } catch (err) {
            console.log("Error geocoding address: ", err);
        }
    }

        const getListingFromDB = async () => {
            try {
                const collectionRef = collection(db, "listings");
                const queryRef = query(collectionRef, where("city", "==", city));
                const querySnapshot = await getDocs(queryRef);

                const resultFromDB = [];
                querySnapshot.forEach((doc) => {
                    resultFromDB.push({ id: doc.id, listing: doc.data() });
                });
                setListingsList(resultFromDB);
            } catch (err) {
                console.error("Error getting documents: ", err);
            }
        }

        const onMarkerPressed = (listing) => {
            setSelectedListing(listing);
        }

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search for city"
                        onChangeText={(city) => setCity(city)}
                        value={city}
                        placeholderTextColor="#FFFFFF"
                    />
                    <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
                        <Ionicons name="locate" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <MapView
                    ref={mapRef}
                    initialRegion={defaultRegion}
                    style={styles.map}
                >
                    <Marker
                        coordinate={currLocation.coords}
                        onPress={() => {
                            alert('You are here')
                        }}
                    >
                        <View style={styles.userMarker}>
                            <Ionicons name="person" size={20} color="#FFFFFF" />
                        </View>
                    </Marker>
                    {listingsList.map((listing, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: listing.listing.latitude, longitude: listing.listing.longitude }}
                            onPress={() => onMarkerPressed(listing.listing)}
                        >
                            <View style={styles.marker}>
                                <Text style={styles.markerText}>${listing.listing.rentalPrice}</Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>
                <View style={styles.footer}>
                    <Text style={styles.title}>{listingsList.length} Listings Found</Text>
                </View>

                <Modal
                    visible={selectedListing !== null}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setSelectedListing(null)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedListing(null)}>
                                <Ionicons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                            {selectedListing && (
                                <View>
                                    <Text style={styles.modalTitle}>{selectedListing.vehicleName}</Text>
                                    <Text style={styles.modalDescription}>Owner: {ownerName}</Text>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                                        {selectedListing.image.map((image, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: image.url_full }}
                                                style={styles.modalImage}
                                            />
                                        ))}
                                    </ScrollView>
                                    <Text style={styles.modalDescription}>${selectedListing.rentalPrice}/week</Text>
                                    <TouchableOpacity
                                        style={styles.viewDetailsButton}
                                        onPress={() => {
                                            navigation.navigate('Booking Screen', {
                                                listing: selectedListing,
                                                ownerName: ownerName,
                                            });
                                            setSelectedListing(null);
                                        }}
                                    >
                                        <Text style={styles.viewDetailsText}>View Details</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        )
    };

    export default SearchScreen;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#F5F5F5',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: '#4A90E2',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        locationButton: {
            padding: 10,
            backgroundColor: '#4A90E2',
            borderRadius: 20,
        },
        map: {
            flex: 1,
        },
        userMarker: {
            backgroundColor: '#4A90E2',
            borderRadius: 50,
            padding: 8,
        },
        marker: {
            backgroundColor: '#FF5A5F',
            borderRadius: 20,
            padding: 8,
            borderWidth: 2,
            borderColor: '#FFFFFF',
        },
        markerText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 12,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            minHeight: 200,
        },
        closeButton: {
            alignSelf: 'flex-end',
            padding: 10,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#333333',
        },
        modalDescription: {
            fontSize: 16,
            color: '#666666',
            marginBottom: 20,
        },
        imageContainer: {
            marginBottom: 20,
        },
        modalImage: {
            width: 200,
            height: 150,
            marginHorizontal: 10,
            borderRadius: 8,
            backgroundColor: '#F5F5F5',
        },
        viewDetailsButton: {
            backgroundColor: '#4A90E2',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
        },
        viewDetailsText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        },
    });