import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { TabBarVisibilityContext } from './_layout';
import { ScrollContext } from './_layout'; // Correct import
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

const Feed = () => {
    const navigation = useNavigation();
    const { scrollY } = useContext(ScrollContext);    
    const [universities, setUniversities] = useState([]);
    const [newsItems, setNewsItems] = useState([]);
    const [likedNews, setLikedNews] = useState({});

    useEffect(() => {
        // Load data from data.json
        if (universitiesData && universitiesData.universities) {
            // Format universities for display
            const formattedUniversities = universitiesData.universities.map((uni, index) => ({
                id: index + 1,
                name: uni.name || 'University',
                location: uni.location || '',
                description: uni.description || '',
                logo: 'logo',
                website: uni.url || '',
                faculties: uni.faculties || [],
                departments: uni.departments || [],
                staticLogo: uni.staticLogo || null
            }));
            
            setUniversities(formattedUniversities);
            
            // Collect all news from all universities
            let allNews = [];
            universitiesData.universities.forEach((uni, uniIndex) => {
                if (uni.news && Array.isArray(uni.news)) {
                    const universityNews = uni.news.map((news, newsIndex) => {
                        return {
                            id: `${uniIndex}-${newsIndex}`,
                            universityId: uniIndex + 1,
                            universityName: uni.name,
                            title: news.title || 'University News',
                            author: 'University Staff',
                            content: news.content || 'No content available',
                            timeAgo: news.date || 'Recently',
                            link: news.link || '',
                            image: news.image || '',
                            likes: Math.floor(Math.random() * 100),
                            comments: Math.floor(Math.random() * 30),
                            liked: false
                        };
                    });
                    allNews = [...allNews, ...universityNews];
                }
            });
            
            // Only use news items with titles
            const validNews = allNews.filter(item => item.title && item.title.trim() !== '');
            
            setNewsItems(validNews);
        }
    }, []);
    
    // Track scroll position to control tab bar visibility
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    const handleLike = (postId) => {
        setNewsItems((prevNews) =>
          prevNews.map((news) =>
            news.id === postId
              ? { ...news, likes: news.liked ? news.likes - 1 : news.likes + 1, liked: !news.liked }
              : news
          )
        );
    };

    // University card renderer
    const renderUniversityCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.universityCard}
            onPress={() => navigation.navigate('Profile', { universityId: item.id })}
        >
            <Image 
                source={getUniversityLogo(item.name)} 
                style={styles.universityLogo} 
            />
            <View style={styles.universityInfo}>
                <Text style={styles.universityName}>{item.name}</Text>
                <Text style={styles.universityLocation}>{item.website}</Text>
                {item.faculties && item.faculties.length > 0 && (
                    <Text style={styles.universityDescription} numberOfLines={1}>
                        {item.faculties.length} Faculties
                    </Text>
                )}
            </View>
            <View style={styles.viewMoreContainer}>
                <Text style={styles.viewMoreText}>View Profile</Text>
                <Icon name="chevron-right" size={16} color="#0A66C2" />
            </View>
        </TouchableOpacity>
    );

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile', { universityId: item.universityId })}
            >
              <Image 
                source={getUniversityLogo(item.universityName)} 
                style={styles.avatar} 
              />
            </TouchableOpacity>
            <View style={styles.postHeaderText}>
              <Text style={styles.userName}>{item.author}</Text>
              <Text style={styles.userTitle}>at {item.universityName}</Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Icon name="dots-horizontal" size={24} color="#666" />
            </TouchableOpacity>
          </View>
      
          <View style={styles.postContent}>
            {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
            <Text style={styles.postText}>{item.content || 'No content available'}</Text>
            {item.universityId && (
              <TouchableOpacity 
                style={styles.universityBadge}
                onPress={() => navigation.navigate('Profile', { universityId: item.universityId })}
              >
                <Icon name="school" size={14} color="#FFFFFF" />
                <Text style={styles.universityBadgeText}>
                  {item.universityName || 'University'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
      
          <View style={styles.postStats}>
            <Text style={styles.statsText}>{item.likes} likes • {item.comments} comments</Text>
          </View>
      
          <View style={styles.divider} />
      
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Icon
                name="thumb-up-outline"
                size={20}
                color={item.liked ? '#0A66C2' : '#666'} // Blue if liked, gray otherwise
              />
              <Text style={[styles.actionText, { color: item.liked ? '#0A66C2' : '#666' }]}>
                Like
              </Text>
            </TouchableOpacity>
      
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="comment-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
      
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => item.link ? navigation.navigate('WebView', { url: item.link }) : null}
            >
              <Icon name="share-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Top navigation bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Icon name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                    />
                </View>
                <TouchableOpacity style={styles.messageIcon}>
                    <Icon name="message-text-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={newsItems}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.feedContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListHeaderComponent={() => (
                    <View>
                        <Text style={styles.sectionTitle}>Universities</Text>
                        <FlatList
                            horizontal
                            data={universities}
                            renderItem={renderUniversityCard}
                            keyExtractor={item => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.universityList}
                        />
                        <Text style={styles.sectionTitle}>Latest News</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="newspaper-variant-outline" size={50} color="#888" />
                        <Text style={styles.emptyText}>No news available</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F2EF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    logo: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF3F8',
        marginHorizontal: 10,
        paddingHorizontal: 10,
        borderRadius: 4,
        height: 36,
    },
    searchInput: {
        flex: 1,
        marginLeft: 5,
        fontSize: 14,
    },
    messageIcon: {
        padding: 5,
    },
    createPostCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginHorizontal: 10,
        marginTop: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    createPostTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    postInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 30,
        marginLeft: 10,
        padding: 10,
    },
    postInputText: {
        color: '#666',
    },
    createPostActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    createPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    createPostButtonText: {
        marginLeft: 5,
        color: '#666',
    },
    feedContainer: {
        padding: 10,
    },
    postContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    postHeader: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    postHeaderText: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    userTitle: {
        fontSize: 14,
        color: '#666',
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
    },
    moreButton: {
        justifyContent: 'center',
    },
    postContent: {
        marginBottom: 10,
    },
    postText: {
        fontSize: 15,
        lineHeight: 20,
    },
    postStats: {
        marginBottom: 10,
    },
    statsText: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 5,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    actionText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 12,
        marginLeft: 10,
    },
    universityList: {
        paddingHorizontal: 10,
    },
    universityCard: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginRight: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    universityLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignSelf: 'center',
        marginBottom: 10,
    },
    universityInfo: {
        alignItems: 'center',
    },
    universityName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    universityLocation: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
        textAlign: 'center',
    },
    universityDescription: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    universityBadge: {
        backgroundColor: '#0A66C2',
        borderRadius: 12,
        padding: 6,
        paddingHorizontal: 10,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    universityBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    viewMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    viewMoreText: {
        fontSize: 12,
        color: '#0A66C2',
        fontWeight: '500',
        marginRight: 4,
    },
});

export default Feed;
