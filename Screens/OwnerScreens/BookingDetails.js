import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { db } from '../../FirebaseConfig'
import { getDocs, collection, doc, updateDoc, query, where } from "firebase/firestore";

const BookingDetails = ({ navigation, route }) => {

    const { bookingDetailList } = route.params;
    const [renterData, setRenterData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOwnerList();
    }, [bookingDetailList]);

    const getOwnerList = async () => {
        try {
            const collectionRef = collection(db, 'users');
            const queryRef = query(collectionRef, where('id', '==', bookingDetailList.booking.renterId));

            const querySnapshot = await getDocs(queryRef);
            if (querySnapshot.docs.length > 0) {
                const resultFromDB = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRenterData(resultFromDB[0]);
            }

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
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const btnConfirmBookingPressed = async () => {
        try {
            console.log(`Booking: ${JSON.stringify(bookingDetailList)}`)
            //cancel booking logic here
            const min = 1;
            const max = 100;
            const docRef = doc(db, 'bookings', bookingDetailList.id)

            await updateDoc(docRef, {
                bookingStatus: 'Confirmed',
                bookingConfirmationCode: `${Math.floor(Math.random() * (max - min + 1)) + min}`
            });

            alert('Booking Confirmed successfully.');
            navigation.navigate('Manage Booking')
        } catch (err) {
            console.error("Error updating document: ", err);
            alert('Failed to confirm booking. Please try again later.');
        }
    }

    const btnCancelBookingPressed = async () => {
        try {
            //cancel booking logic here
            const docRef = doc(db, 'bookings', bookingDetailList.id)

            await updateDoc(docRef, {
                bookingStatus: 'Cancelled',
                bookingConfirmationCode: 'Booking Canclled'
            });

            alert('Booking cancelled successfully.');
            navigation.goBack();
        } catch (err) {
            console.error("Error updating document: ", err);
            alert('Failed to cancel booking. Please try again later.');
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    style={styles.profileImage}
                    source={{ uri: renterData.profileImagePath }}
                />
                <Text style={styles.title}>{renterData?.name || 'Renter Name Not Available'}</Text>
                <ScrollView horizontal={true} style={styles.imageContainer}>
                    {bookingDetailList.booking.image && bookingDetailList.booking.image.length > 0 ? (
                        bookingDetailList.booking.image.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image.url_full }}
                                style={styles.image}
                            />
                        ))
                    ) : (
                        <Text style={styles.noImageText}>No images available</Text>
                    )}
                </ScrollView>
                <View style={styles.detailsContainer}>
                    <DetailItem label="Rental Price" value={`$${bookingDetailList.booking.listingPrice}/week`} />
                    <DetailItem label="Vehicle Name" value={bookingDetailList.booking.vehicleName} />
                    <DetailItem label="Min Seat" value={bookingDetailList.booking.minSeat} />
                    <DetailItem label="Max Seat" value={bookingDetailList.booking.maxSeat} />
                    <DetailItem label="License Plate" value={bookingDetailList.booking.licensePlate} />
                    <DetailItem label="Model Year" value={bookingDetailList.booking.modelYear} />
                    <DetailItem label="Start Date" value={new Date(bookingDetailList.booking.bookingStartDate).toDateString()} />
                    <DetailItem label="End Date" value={new Date(bookingDetailList.booking.bookingEndDate).toDateString()} />
                    <DetailItem label="Status" value={bookingDetailList.booking.bookingStatus} />
                    <DetailItem
                        label="Confirmation Code"
                        value={bookingDetailList.booking.bookingConfirmationCode || 'Not yet confirmed'}
                    />
                </View>
                {
                    bookingDetailList.booking.bookingStatus === 'Pending...' ? (
                        <View>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={btnConfirmBookingPressed}
                            >
                                <Text style={styles.buttonText}>Confirm Booking</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={btnCancelBookingPressed}
                            >
                                <Text style={styles.buttonText}>Cancel Booking</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.noActionText}>Action is already taken. View the booking status</Text>
                    )
                }
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

export default BookingDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#2c3e50',
        letterSpacing: 0.5,
    },
    imageContainer: {
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    image: {
        width: 280,
        height: 220,
        marginRight: 15,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noImageText: {
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 30,
        color: '#7f8c8d',
    },
    detailsContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        marginHorizontal: 15,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    detailLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#34495e',
    },
    detailValue: {
        fontSize: 17,
        color: '#2c3e50',
        textAlign: 'right',
        flex: 1,
        marginLeft: 15,
    },
    profileImage: {
        width: 180,
        height: 180,
        borderRadius: 90,
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noActionText: {
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 30,
        color: '#7f8c8d',
    },
});