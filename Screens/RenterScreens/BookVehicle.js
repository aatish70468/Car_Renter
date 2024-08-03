import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../../FirebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure to install this package

const BookVehicle = ({ navigation, route }) => {
    const { listing, ownerName } = route.params;
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [show, setShow] = useState(false);

    useEffect(() => {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(startDate.getDate() + 7);
        setEndDate(newEndDate);
    }, [startDate]);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setShow(Platform.OS === 'ios');
        setStartDate(currentDate);
    };

    const showDatepicker = () => setShow(true);

    const btnBookNowPressed = async () => {
        const dataToSave = {
            bookingStartDate: startDate.toISOString(),
            bookingEndDate: endDate.toISOString(),
            ownerId: listing.ownerId,
            renterId: auth.currentUser.uid,
            bookingStatus: 'Pending...',
            listingPrice: listing.rentalPrice,
            vehicleName: listing.vehicleName,
            minSeat: listing.minSeat,
            maxSeat: listing.maxSeat,
            licensePlate: listing.licensePlate,
            modelYear: listing.modelYear,
            image: listing.image,
            bookingConfirmationCode: null
        };

        try {
            let isOverlapping = false;
            const collectionRef = collection(db, 'bookings');
            const queryRef = query(
                collectionRef,
                where('licensePlate', '==', listing.licensePlate),
                where('bookingStatus', '!=', 'Cancelled')
            );

            const querySnapshot = await getDocs(queryRef);
            if (querySnapshot.docs.length > 0) {
                querySnapshot.forEach((doc) => {
                    const booking = doc.data();
                    const bookingStart = new Date(booking.bookingStartDate);
                    const bookingEnd = new Date(booking.bookingEndDate);
                    if (
                        bookingStart <= startDate &&
                        bookingEnd >= startDate
                    ) {
                        isOverlapping = true;
                    }
                });
            }

            if (isOverlapping) {
                alert('Vehicle is already booked during this time period.');
                return;
            } else {
                const docRef = await addDoc(collectionRef, dataToSave);
                console.log(`Booking Document Id: ${docRef.id}`);
                alert('Booking successful!');
            }
        } catch (err) {
            console.error('Error adding document: ', err);
            alert('Failed to book vehicle. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>{listing.vehicleName}</Text>
                <Text style={styles.ownerName}>Owned by {ownerName}</Text>
                
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                    {listing.image.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image.url_full }}
                            style={styles.image}
                        />
                    ))}
                </ScrollView>
                
                <View style={styles.detailsContainer}>
                    <DetailItem icon="pricetag" label="Rental Price" value={`$${listing.rentalPrice}/week`} />
                    <DetailItem icon="people" label="Capacity" value={`${listing.minSeat} - ${listing.maxSeat} seats`} />
                    <DetailItem icon="car" label="License Plate" value={listing.licensePlate} />
                    <DetailItem icon="calendar" label="Model Year" value={listing.modelYear} />
                </View>

                <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Start Date:</Text>
                    <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
                        <Text style={styles.dateText}>{startDate.toDateString()}</Text>
                        <Icon name="calendar-outline" size={24} color="#4A90E2" />
                    </TouchableOpacity>

                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={startDate}
                            mode={'date'}
                            is24Hour={true}
                            display="default"
                            onChange={onChange}
                        />
                    )}

                    <Text style={styles.dateLabel}>End Date:</Text>
                    <View style={styles.dateInput}>
                        <Text style={styles.dateText}>{endDate.toDateString()}</Text>
                        <Icon name="calendar-outline" size={24} color="#4A90E2" />
                    </View>
                </View>

                <TouchableOpacity style={styles.bookNowButton} onPress={btnBookNowPressed}>
                    <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
        <Icon name={icon} size={24} color="#4A90E2" style={styles.detailIcon} />
        <View>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

export default BookVehicle;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 5,
        color: '#333333',
    },
    ownerName: {
        fontSize: 16,
        color: '#666666',
        marginHorizontal: 20,
        marginBottom: 15,
    },
    imageContainer: {
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 200,
        marginHorizontal: 10,
        borderRadius: 12,
    },
    detailsContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailIcon: {
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666666',
    },
    detailValue: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    dateContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    dateLabel: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 5,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 16,
        color: '#333333',
    },
    bookNowButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    bookNowText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});