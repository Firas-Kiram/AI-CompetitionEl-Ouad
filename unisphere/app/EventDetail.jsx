import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const EventDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { event } = route.params || {
        // Default event data if none is passed
        id: '1',
        title: 'Tech Innovation Hackathon',
        university: 'MIT University',
        date: 'June 15, 2023',
        time: '10:00 AM - 8:00 PM',
        duration: '10 hours',
        type: 'Competition',
        location: 'Engineering Building, Room 302',
        participants: 89,
        maxParticipants: 120,
        image: require('../assets/images/logo.png'),
        description: 'Join us for a day-long hackathon focused on developing innovative solutions for smart cities. Cash prizes for the top three teams!',
        organizer: 'Computer Science Department',
        contactEmail: 'events@mituniversity.edu',
        prerequisites: 'Basic programming skills, laptop required',
        prizes: '$1,000 for 1st place, $500 for 2nd place, $250 for 3rd place',
        schedule: [
            { time: '10:00 AM', activity: 'Registration and team formation' },
            { time: '11:00 AM', activity: 'Kickoff and challenge announcement' },
            { time: '12:00 PM', activity: 'Lunch break' },
            { time: '1:00 PM', activity: 'Hacking begins' },
            { time: '6:00 PM', activity: 'Dinner break' },
            { time: '7:00 PM', activity: 'Final submissions' },
            { time: '7:30 PM', activity: 'Presentations and judging' },
            { time: '8:00 PM', activity: 'Awards ceremony' },
        ]
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Event image */}
            <Image source={event.image} style={styles.eventImage} />

            {/* Event basic info */}
            <View style={styles.eventInfoContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.universityName}>Hosted by {event.university}</Text>
                
                <View style={styles.infoRow}>
                    <Icon name="calendar" size={18} color="#666" />
                    <Text style={styles.infoText}>{event.date}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Icon name="clock-outline" size={18} color="#666" />
                    <Text style={styles.infoText}>{event.time} ({event.duration})</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Icon name="tag" size={18} color="#666" />
                    <Text style={styles.infoText}>{event.type}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Icon name="map-marker" size={18} color="#666" />
                    <Text style={styles.infoText}>{event.location}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="account-group" size={18} color="#666" />
                    <Text style={styles.infoText}>
                        {event.participants} of {event.maxParticipants} participants
                    </Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${(event.participants / event.maxParticipants) * 100}%` }
                            ]} 
                        />
                    </View>
                </View>
            </View>

            {/* Event description */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>About This Event</Text>
                <Text style={styles.description}>{event.description}</Text>
            </View>

            {/* Organizer details */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Organizer</Text>
                <Text style={styles.organizerName}>{event.organizer}</Text>
                <View style={styles.infoRow}>
                    <Icon name="email-outline" size={18} color="#666" />
                    <Text style={styles.infoText}>{event.contactEmail}</Text>
                </View>
            </View>

            {/* Prerequisites */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Prerequisites</Text>
                <Text style={styles.description}>{event.prerequisites}</Text>
            </View>

            {/* Prizes (if any) */}
            {event.prizes && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Prizes</Text>
                    <Text style={styles.description}>{event.prizes}</Text>
                </View>
            )}

            {/* Schedule */}
            {event.schedule && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    {event.schedule.map((item, index) => (
                        <View key={index} style={styles.scheduleItem}>
                            <Text style={styles.scheduleTime}>{item.time}</Text>
                            <Text style={styles.scheduleActivity}>{item.activity}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Participation button */}
            <View style={styles.participateButtonContainer}>
                <TouchableOpacity style={styles.participateButton}>
                    <Text style={styles.participateButtonText}>Participate in Event</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F2EF',
    },
    header: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    eventInfoContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
    eventTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    universityName: {
        fontSize: 16,
        color: '#0A66C2',
        marginBottom: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 15,
        color: '#555',
        marginLeft: 10,
    },
    progressBarContainer: {
        marginTop: 6,
        marginBottom: 4,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0A66C2',
        borderRadius: 3,
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
    },
    organizerName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    scheduleItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    scheduleTime: {
        width: 90,
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    scheduleActivity: {
        flex: 1,
        fontSize: 15,
        color: '#555',
    },
    participateButtonContainer: {
        padding: 16,
        marginBottom: 30,
    },
    participateButton: {
        backgroundColor: '#0A66C2',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    participateButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EventDetail; 