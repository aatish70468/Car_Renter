import { React, useState, useEffect, useCallback } from "react"
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image } from "react-native"
import { useFocusEffect } from '@react-navigation/native'

//import firebase
import { auth, db } from "../../FirebaseConfig";
import { query, where, collection, onSnapshot } from "firebase/firestore"

const ManageBookings = ({ navigation }) => {

    const [bookingsList, setBookingsList] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchBookingList();
        }, [])
    )

    const fetchBookingList = async () => {
        try {
            const collectionRef = collection(db, 'bookings');
            const queryRef = query(collectionRef, where('ownerId', '==', auth.currentUser.uid));

            const data = onSnapshot(queryRef, (snapshot) => {
                if (snapshot.docs.length > 0) {
                    const resultFromDB = snapshot.docs.map(doc => ({ id: doc.id, booking: doc.data() }));
                    setBookingsList(resultFromDB);
                }
            })
        } catch (err) {
            console.error("Error getting documents: ", err);
            alert('Failed to fetch bookings. Please try again later.');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Booking</Text>
            {
                bookingsList.length === 0 ? (
                    <Text>No bookings found</Text>
                ) : (
                    <FlatList
                        data={bookingsList}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('Booking Details', { bookingDetailList: item })}
                            >
                                <Text style={styles.vehicleName}>Vehicle Name: {item.booking.vehicleName}</Text>
                                <Text style={styles.detailText}>Start Date: {new Date(item.booking.bookingStartDate).toDateString()}</Text>
                                <Text style={styles.detailText}>Status: {item.booking.bookingStatus}</Text>
                                <Text style={styles.detailText}>
                                    Confirmation Code: {item.booking.bookingConfirmationCode || 'Not yet confirmed'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )
            }
        </View>
    )
};

export default ManageBookings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    detailText: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
});