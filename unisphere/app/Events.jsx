import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, Animated, ActivityIndicator, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { ScrollContext } from './_layout';
import universitiesData from '../assets/data/data.json';

// Import all static images
const universityLogos = {
    'logo': require('../src/images/elOuedLogo.png'),
    'icon': require('../src/images/ensiaLogo.png'),
    'react-logo': require('../src/images/ghardaiaLogo.png'),
    'splash-icon': require('../src/images/mitLogo.png'),
};

// Get university logo based on name
const getUniversityLogo = (name) => {
    switch(name) {
        case "University of El Oued":
            return universityLogos['logo'];
        case "ENSIA":
            return universityLogos['icon'];
        case "University of Ghardaia":
            return universityLogos['react-logo'];
        case "MIT":
            return universityLogos['splash-icon'];
        default:
            return universityLogos['logo'];
    }
};

// Filter types for events
const eventTypes = ['All', 'Conference', 'Seminar', 'Workshop', 'Exhibition', 'Competition'];

const sortEventsByDate = (events) => {
  return events.sort((a, b) => new Date(a.date) - new Date(b.date)); // Ascending order
};



const Events = () => {
    const navigation = useNavigation();
    const { scrollY } = useContext(ScrollContext);
    const [selectedType, setSelectedType] = useState('All');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'topics'
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    
    // Track scroll position to control tab bar visibility
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    const fetchSentimentAndTopic = async (comment) => {
        try {
          const response = await fetch('http://192.168.168.8:5000/label', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch sentiment and topic');
          }
      
          const data = await response.json();
          return data; // { sentiment: 'positive' or 'negative', topic: 'some topic' }
        } catch (error) {
          console.error('Error fetching sentiment and topic:', error);
          return { sentiment: 'unknown', topic: 'unknown' }; // Fallback values
        }
      };
    // Load universities and events from data.json
    useEffect(() => {
        loadUniversitiesAndEvents();
    }, []);

    // Filter events when type changes
    useEffect(() => {
        filterEventsByType();
    }, [selectedType]);

    const loadUniversitiesAndEvents = () => {
        setLoading(true);
        
        try {
            if (universitiesData && universitiesData.universities) {
                // Format universities
                const formattedUniversities = universitiesData.universities.map((uni, index) => ({
                    id: index + 1,
                    name: uni.name || 'University',
                    location: uni.location || '',
                    description: uni.description || '',
                    website: uni.url || '',
                    founded: 2000, // Default values since this data might not exist
                    students: 5000,
                    faculties: uni.faculties || [],
                    departments: uni.departments || []
                }));
                
                setUniversities(formattedUniversities);
                
                // Collect all events
                let allEvents = [];
                universitiesData.universities.forEach((uni, uniIndex) => {
                    if (uni.events && Array.isArray(uni.events)) {
                        const universityEvents = uni.events.map((event, eventIndex) => {
                            // Determine event type based on title or any other logic
                            const determineEventType = (title) => {
                                title = title.toLowerCase();
                                if (title.includes('conference')) return 'Conference';
                                if (title.includes('seminar')) return 'Seminar';
                                if (title.includes('workshop')) return 'Workshop';
                                if (title.includes('exhibition')) return 'Exhibition';
                                if (title.includes('competition')) return 'Competition';
                                return 'Conference'; // Default type
                            };
                            
                            return {
                                id: `${uniIndex}-${eventIndex}`,
                                title: event.title || 'University Event',
                                university: uni.name,
                                universityId: uniIndex + 1,
                                date: event.date || 'Upcoming',
                                time: '9:00 AM - 5:00 PM', // Default time since it might not exist
                                duration: '8 hours',
                                type: determineEventType(event.title || ''),
                                location: uni.location || 'University Campus',
                                participants: Math.floor(Math.random() * 100) + 50,
                                maxParticipants: 200,
                                image: require('../assets/images/logo.png'),
                                description: event.content || 'No description available',
                                link: event.link || ''
                            };
                        });
                        allEvents = [...allEvents, ...universityEvents];
                    }
                });
                
                // Only use events with titles
                const validEvents = allEvents.filter(item => item.title && item.title.trim() !== '');
                
                setEvents(sortEventsByDate(validEvents));
            } else {
                setError('No university data found');
            }
        } catch (err) {
            console.error('Error loading university data:', err);
            setError('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const filterEventsByType = () => {
        if (selectedType === 'All') return; // If 'All' is selected, we don't need to filter
        
        const filtered = events.filter(event => event.type === selectedType);
        setEvents(filtered);
    };

    // Filter events based on search query and selected university
    const filteredEvents = events.filter(event => {
        if (searchQuery) {
        const query = searchQuery.toLowerCase();
            if (!(
            event.title.toLowerCase().includes(query) ||
            event.university.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query) ||
            event.type.toLowerCase().includes(query)
            )) {
                return false;
            }
        }
        
        if (selectedUniversity) {
            return event.universityId === selectedUniversity.id;
        }
        
        return true;
    });

    const sortedEvents = sortEventsByDate(filteredEvents);

    // Open review modal for an event
    const openReviewModal = (event) => {
        setSelectedEvent(event);
        setReviewModalVisible(true);
        fetchReviews(event.id);
    };

    // Fetch reviews for an event
    const fetchReviews = async (eventId) => {
        setLoadingReviews(true);
        try {
            const dummyReviews = [
                { id: '1', comment: 'Great event!', username: 'john_doe', rating: 4 },
                { id: '2', comment: 'Poorly organized.', username: 'jane_doe', rating: 2 },
            ];

            const comments = dummyReviews.map((review) => review.comment);
            const sentiments = await fetchSentimentAndTopic(comments);

            const reviewsWithSentiments = dummyReviews.map((review, index) => ({
                ...review,
                sentiment: sentiments[index].sentiment,
                topic: sentiments[index].topic_label,
            }));

            setReviews(reviewsWithSentiments);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    // Submit a review
    const submitReview = async () => {
        if (!selectedEvent) return;
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            // In a real app, send review to API
            // await axios.post(`${API_BASE_URL}/events/${selectedEvent.id}/reviews`, {
            //     rating,
            //     comment: reviewText
            // });

            // Add the new review to the list (in a real app, fetch from API again)
            const newReview = {
                id: Date.now().toString(),
                userId: '999', // Current user ID
                username: 'current_user', // Current username
                userImage: null,
                rating,
                comment: reviewText,
                createdAt: new Date().toISOString()
            };

            setReviews([newReview, ...reviews]);
            setRating(0);
            setReviewText('');
            alert('Review submitted successfully!');
            
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Failed to submit review. Please try again.');
        }
    };

    const renderEventTypeFilter = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.filterButton, 
                selectedType === item && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType(item)}
        >
            <Text 
                style={[
                    styles.filterText, 
                    selectedType === item && styles.filterTextActive
                ]}
            >
                {item}
            </Text>
        </TouchableOpacity>
    );

    const renderEventCard = ({ item }) => (
        <TouchableOpacity 
            style={[styles.eventCard]}
            onPress={() => item.link ? navigation.navigate('WebView', { url: item.link }) : navigation.navigate('EventDetail', { event: item })}
        >
            {/* Display the event image or university logo */}
            {item.image ? (
                <Image 
                    source={getUniversityLogo(item.name)} 
                    style={styles.eventImage} 
                />
            ) : (
                <Image 
                    source={getUniversityLogo(item.university)} 
                    style={styles.eventImage} 
                />
            )}
            
            <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                
                <TouchableOpacity
                    style={styles.universityBadge}
                    onPress={(e) => {
                        e.stopPropagation();
                        setSelectedUniversity(universities.find(u => u.id === item.universityId));
                    }}
                >
                    <Image 
                        source={getUniversityLogo(item.university)} 
                        style={styles.universityLogo} 
                    />
                    <Text style={styles.universityBadgeText}>{item.university}</Text>
                </TouchableOpacity>
                
                <View style={styles.eventInfoRow}>
                    <Icon name="calendar" size={16} color="#666" />
                    <Text style={styles.eventInfo}>{item.date}</Text>
                </View>
                
                <View style={styles.eventInfoRow}>
                    <Icon name="clock-outline" size={16} color="#666" />
                    <Text style={styles.eventInfo}>{item.time} ({item.duration})</Text>
                </View>
                
                <Text style={styles.eventDescription} numberOfLines={3}>{item.description}</Text>
                
                {/* Action buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.participateButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            if (item.link) {
                                navigation.navigate('WebView', { url: item.link });
                            } else {
                                // Fallback to detail view if no link is available
                                navigation.navigate('EventDetail', { event: item });
                            }
                        }}
                    >
                        <Icon name="open-in-new" size={18} color="#FFFFFF" />
                        <Text style={styles.participateButtonText}>Participate</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.reviewButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            openReviewModal(item);
                        }}
                    >
                        <Icon name="star" size={18} color="#FFFFFF" />
                        <Text style={styles.reviewButtonText}>Reviews</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderReviewItem = ({ item }) => {
        const getEmoji = (sentiment) => {
            if (sentiment === 'positive') return '😊';
            if (sentiment === 'negative') return '😞';
            return '❓'; // Unknown sentiment
        };

        return (
            <View style={styles.reviewItem}>
                <Text style={styles.reviewComment}>{item.comment}</Text>
                <View style={styles.sentimentContainer}>
                    <Text style={styles.sentimentEmoji}>{getEmoji(item.sentiment)}</Text>
                    <Text style={styles.sentimentLabel}>
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </Text>
                    <Text style={styles.topicLabel}>Topic: {item.topic}</Text>
                </View>
            </View>
        );
    };

    const renderTopicItem = ({ item }) => (
        <TouchableOpacity style={styles.topicItem}>
            <Text style={styles.topicTitle}>{item.title}</Text>
            <View style={styles.topicCountContainer}>
                <Text style={styles.topicCount}>{item.count}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            {loading ? (
                <ActivityIndicator size="large" color="#0A66C2" />
            ) : error ? (
                <>
                    <Icon name="alert-circle-outline" size={50} color="#888" />
                    <Text style={styles.emptyText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadUniversitiesAndEvents}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Icon name="calendar-blank" size={50} color="#888" />
                    <Text style={styles.emptyText}>No events found</Text>
                </>
            )}
        </View>
    );

    const renderEmptyReviews = () => (
        <View style={styles.emptyReviewsContainer}>
            {loadingReviews ? (
                <ActivityIndicator size="small" color="#0A66C2" />
            ) : (
                <>
                    <Icon name="comment-outline" size={40} color="#888" />
                    <Text style={styles.emptyReviewsText}>
                        {activeTab === 'reviews' ? 'No reviews yet' : 'No topics yet'}
                    </Text>
                    {activeTab === 'reviews' && (
                        <Text style={styles.beFirstText}>Be the first to write a review!</Text>
                    )}
                </>
            )}
        </View>
    );

    // Render university item
    const renderUniversityItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.universityButton, 
                selectedUniversity?.id === item.id && styles.universityButtonActive
            ]}
            onPress={() => {
                if (selectedUniversity?.id === item.id) {
                    setSelectedUniversity(null);
                } else {
                    setSelectedUniversity(item);
                }
            }}
        >
            <Image 
                source={getUniversityLogo(item.name)} 
                style={[
                    styles.universityImage,
                    selectedUniversity?.id === item.id && styles.universityImageActive
                ]} 
            />
            <Text 
                style={[
                    styles.universityName, 
                    selectedUniversity?.id === item.id && styles.universityNameActive
                ]}
                numberOfLines={1}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Events</Text>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter by event type */}
            <View style={styles.filterContainer}>
                <FlatList
                    data={eventTypes}
                    renderItem={renderEventTypeFilter}
                    keyExtractor={item => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Events list */}
            <FlatList
                data={sortedEvents} // Use sorted events
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.eventsContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={renderEmptyList}
                refreshing={loading}
                onRefresh={loadUniversitiesAndEvents}
            />

            {/* Review Modal */}
            <Modal
                visible={reviewModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {selectedEvent ? selectedEvent.title : 'Event'} 
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.closeButton}
                                        onPress={() => setReviewModalVisible(false)}
                                    >
                                        <Icon name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {/* Tabs */}
                                <View style={styles.tabContainer}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.tab, 
                                            activeTab === 'reviews' && styles.activeTab
                                        ]}
                                        onPress={() => setActiveTab('reviews')}
                                    >
                                        <Icon 
                                            name="star" 
                                            size={18} 
                                            color={activeTab === 'reviews' ? '#0A66C2' : '#666'} 
                                        />
                                        <Text 
                                            style={[
                                                styles.tabText, 
                                                activeTab === 'reviews' && styles.activeTabText
                                            ]}
                                        >
                                            Reviews
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[
                                            styles.tab, 
                                            activeTab === 'topics' && styles.activeTab
                                        ]}
                                        onPress={() => setActiveTab('topics')}
                                    >
                                        <Icon 
                                            name="tag-multiple" 
                                            size={18} 
                                            color={activeTab === 'topics' ? '#0A66C2' : '#666'} 
                                        />
                                        <Text 
                                            style={[
                                                styles.tabText, 
                                                activeTab === 'topics' && styles.activeTabText
                                            ]}
                                        >
                                            Topics
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Reviews Content */}
                                {activeTab === 'reviews' && (
                                    <View style={styles.reviewsContent}>
                                        {/* Write a review section */}
                                        <View style={styles.writeReviewContainer}>
                                            <Text style={styles.writeReviewTitle}>Write a Review</Text>
                                            
                                            <View style={styles.ratingInputContainer}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <TouchableOpacity 
                                                        key={star} 
                                                        onPress={() => setRating(star)}
                                                    >
                                                        <Icon 
                                                            name="star" 
                                                            size={30} 
                                                            color={star <= rating ? '#FFD700' : '#E0E0E0'} 
                                                            style={{ marginHorizontal: 3 }}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            
                                            <TextInput
                                                style={styles.reviewInput}
                                                placeholder="Share your experience..."
                                                multiline={true}
                                                numberOfLines={3}
                                                value={reviewText}
                                                onChangeText={setReviewText}
                                            />
                                            
                                            <TouchableOpacity 
                                                style={styles.submitReviewButton}
                                                onPress={submitReview}
                                            >
                                                <Text style={styles.submitReviewText}>Submit Review</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Reviews list */}
                                        <Text style={styles.reviewsListTitle}>All Reviews</Text>
                                        
                                        <FlatList
                                            data={reviews}
                                            renderItem={renderReviewItem}
                                            keyExtractor={item => item.id}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.reviewsList}
                                            ListEmptyComponent={renderEmptyReviews}
                                        />
                                    </View>
                                )}

                                {/* Topics Content */}
                                {activeTab === 'topics' && (
                                    <View style={styles.topicsContent}>
                                        <Text style={styles.topicsTitle}>Popular Topics</Text>
                                        
                                        <FlatList
                                            data={topics}
                                            renderItem={renderTopicItem}
                                            keyExtractor={item => item.id}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.topicsList}
                                            ListEmptyComponent={renderEmptyReviews}
                                        />
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F2EF',
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF3F8',
        paddingHorizontal: 10,
        borderRadius: 8,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 5,
        fontSize: 14,
    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    filterList: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#0A66C2',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    eventsContainer: {
        padding: 15,
        flexGrow: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    eventDetails: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    universityName: {
        fontSize: 16,
        color: '#0A66C2',
        marginBottom: 12,
    },
    eventInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventInfo: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    eventDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginTop: 12,
        marginBottom: 16,
    },
    participantsContainer: {
        marginBottom: 16,
    },
    participantsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    participateButton: {
        backgroundColor: '#0A66C2',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    participateButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    reviewButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 0.8,
    },
    reviewButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0A66C2',
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginRight: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#0A66C2',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    activeTabText: {
        color: '#0A66C2',
        fontWeight: 'bold',
    },
    reviewsContent: {
        flex: 1,
    },
    writeReviewContainer: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    writeReviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ratingInputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'center',
    },
    reviewInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 10,
    },
    submitReviewButton: {
        backgroundColor: '#0A66C2',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitReviewText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    reviewsListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewsList: {
        paddingBottom: 20,
    },
    reviewItem: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#0A66C2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    username: {
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
    },
    sentimentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    sentimentEmoji: {
        fontSize: 18,
        marginRight: 8,
    },
    sentimentLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
    },
    topicLabel: {
        fontSize: 14,
        color: '#0A66C2',
        fontWeight: 'bold',
    },
    reviewDate: {
        fontSize: 12,
        color: '#888',
    },
    emptyReviewsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyReviewsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    beFirstText: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
    topicsContent: {
        flex: 1,
    },
    topicsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    topicsList: {
        paddingBottom: 20,
    },
    topicItem: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topicTitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    topicCountContainer: {
        backgroundColor: '#0A66C2',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topicCount: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 15,
    },
    universitiesContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    universitiesList: {
        paddingHorizontal: 15,
    },
    universityButton: {
        alignItems: 'center',
        marginRight: 20,
        width: 80,
    },
    universityButtonActive: {
        opacity: 1,
    },
    universityImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    universityImageActive: {
        borderColor: '#0A66C2',
    },
    selectedUniversityInfo: {
        backgroundColor: '#F5F5F5',
        margin: 15,
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    universityInfoText: {
        fontSize: 12,
        marginBottom: 5,
        color: '#333',
        flex: 1,
        minWidth: '30%',
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    universityBadge: {
        backgroundColor: '#0A66C2',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    universityBadgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    universityLogo: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 4,
    },
});

export default Events;
