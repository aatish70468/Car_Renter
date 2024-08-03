import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth, db } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot } from "firebase/firestore";

const ReservationScreen = ({ navigation }) => {
    const [reservationList, setReservationList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReservationList();
    }, []);

    const getReservationList = async () => {
        try {
            const collectionRef = collection(db, 'bookings');
            const queryRef = query(collectionRef, where('renterId', '==', auth.currentUser.uid));

            const data = onSnapshot(queryRef, (snapshot) => {
                if (snapshot.docs.length > 0) {
                    const resultFromDB = snapshot.docs.map(doc => ({ id: doc.id, booking: doc.data() }));
                    setReservationList(resultFromDB);
                }
            })
        } catch (err) {
            console.error("Error getting documents: ", err);
            alert('Failed to fetch bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Reservations</Text>
            {
                reservationList.length === 0 ? (
                    <Text style={styles.noReservationText}>No reservations found.</Text>
                ) : (
                    <FlatList
                        data={reservationList}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('Reservation Detail Screen', { reservationDetailList: item })}
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
    );
};

export default ReservationScreen;

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