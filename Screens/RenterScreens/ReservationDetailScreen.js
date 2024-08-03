import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { auth, db } from '../../FirebaseConfig'
import { getDocs, collection, query, where } from "firebase/firestore";

const ReservationDetailScreen = ({ navigation, route }) => {
    const { reservationDetailList } = route.params;
    const [ownerData, setOwnerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOwnerList();
    }, [reservationDetailList]);

    const getOwnerList = async () => {
        try {
            const collectionRef = collection(db, 'users');
            const queryRef = query(collectionRef, where('id', '==', reservationDetailList.booking.ownerId));

            const querySnapshot = await getDocs(queryRef);
            if (querySnapshot.docs.length > 0) {
                const resultFromDB = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOwnerData(resultFromDB[0]);
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    style={styles.profileImage}
                    source={{ uri: ownerData.profileImagePath }}
                />
                <Text style={styles.title}>{ownerData?.name || 'Owner Name Not Available'}</Text>
                <ScrollView horizontal={true} style={styles.imageContainer}>
                    {reservationDetailList.booking.image && reservationDetailList.booking.image.length > 0 ? (
                        reservationDetailList.booking.image.map((image, index) => (
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
                    <DetailItem label="Rental Price" value={`$${reservationDetailList.booking.listingPrice}/week`} />
                    <DetailItem label="Vehicle Name" value={reservationDetailList.booking.vehicleName} />
                    <DetailItem label="Min Seat" value={reservationDetailList.booking.minSeat} />
                    <DetailItem label="Max Seat" value={reservationDetailList.booking.maxSeat} />
                    <DetailItem label="License Plate" value={reservationDetailList.booking.licensePlate} />
                    <DetailItem label="Model Year" value={reservationDetailList.booking.modelYear} />
                    <DetailItem label="Start Date" value={reservationDetailList.booking.bookingStartDate} />
                    <DetailItem label="End Date" value={reservationDetailList.booking.bookingEndDate} />
                    <DetailItem label="Status" value={reservationDetailList.booking.bookingStatus} />
                    <DetailItem
                        label="Confirmation Code"
                        value={reservationDetailList.booking.boookingConfirmationCode || 'Not yet confirmed'}
                    />
                </View>
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

export default ReservationDetailScreen;

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
  });