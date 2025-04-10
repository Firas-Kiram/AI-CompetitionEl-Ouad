import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

// API base URL - replace with your actual server URL when deploying
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'  // Replace this with your actual deployed backend URL
  : 'http://localhost:3000/api';  // Development URL

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Check if viewing own profile or another user's profile
  const isOwnProfile = !route.params || !route.params.userId;
  const userId = route.params?.userId;
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(125);
  const [followingCount, setFollowingCount] = useState(83);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [activeFollowTab, setActiveFollowTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  // Mock data
  const user = {
    name: isOwnProfile ? 'John Doe' : 'Sarah Johnson',
    role: 'Student',
    avatar: require('../assets/images/logo.png'), // Replace with actual path
    rating: 4.5,
    bio: isOwnProfile ? 
      'Computer Science student at University of Technology. Passionate about mobile development and AI.' :
      'UI/UX Design major with a minor in Computer Science. Creative thinker and problem solver.',
    education: isOwnProfile ? 
      'Bachelor of Computer Science, University of Technology (2020 - 2024)' :
      'Bachelor of Design, University of Arts (2021 - 2025)',
    skills: isOwnProfile ? 
      ['React Native', 'JavaScript', 'Python', 'UI/UX Design', 'Data Structures'] :
      ['UI/UX Design', 'Figma', 'Sketch', 'HTML/CSS', 'User Research']
  };
  
  const posts = [
    { id: '1', content: 'Just finished my first React Native project!', likes: 24, comments: 5, time: '2 hours ago' },
    { id: '2', content: 'Looking for study partners for the upcoming exams. Anyone interested?', likes: 15, comments: 8, time: '1 day ago' },
    { id: '3', content: 'Check out this interesting article on AI advancements.', likes: 32, comments: 3, time: '3 days ago' },
  ];
  
  const resumes = [
    { id: '1', title: 'Software Developer Resume', downloads: 45, rating: 4.8, price: 'Free' },
    { id: '2', title: 'Mobile Developer CV', downloads: 23, rating: 4.5, price: '$5.99' },
  ];
  
  const courses = [
    { id: '1', title: 'Advanced React Native', progress: 75, instructor: 'Prof. Sarah Johnson' },
    { id: '2', title: 'Data Structures & Algorithms', progress: 45, instructor: 'Dr. Michael Smith' },
  ];
  
  const events = [
    { id: '1', title: 'Tech Meetup 2023', date: 'Oct 15, 2023', location: 'University Hall' },
    { id: '2', title: 'Coding Competition', date: 'Nov 5, 2023', location: 'Online' },
  ];

  // Mock follower and following data
  const mockFollowers = [
    { id: '1', name: 'Michael Brown', role: 'Student', avatar: require('../assets/images/logo.png') },
    { id: '2', name: 'Emily Johnson', role: 'Teacher', avatar: require('../assets/images/logo.png') },
    { id: '3', name: 'David Wilson', role: 'Student', avatar: require('../assets/images/logo.png') },
    { id: '4', name: 'Sophia Martinez', role: 'Student', avatar: require('../assets/images/logo.png') },
    { id: '5', name: 'Robert Taylor', role: 'Teacher', avatar: require('../assets/images/logo.png') }
  ];

  const mockFollowing = [
    { id: '6', name: 'Jessica Anderson', role: 'Student', avatar: require('../assets/images/logo.png') },
    { id: '7', name: 'Thomas Garcia', role: 'Student', avatar: require('../assets/images/logo.png') },
    { id: '8', name: 'Amanda White', role: 'Teacher', avatar: require('../assets/images/logo.png') },
    { id: '9', name: 'Christopher Lee', role: 'Student', avatar: require('../assets/images/logo.png') }
  ];

  // Check if viewing another user's profile, fetch follow status
  useEffect(() => {
    if (!isOwnProfile) {
      // Simulating API call to check follow status
      setIsLoading(true);
      setTimeout(() => {
        // In a real app, fetch from API:
        // const checkFollowStatus = async () => {
        //   try {
        //     const response = await axios.get(`${API_BASE_URL}/users/${userId}/follow-status`);
        //     setIsFollowing(response.data.isFollowing);
        //   } catch (error) {
        //     console.error('Error checking follow status:', error);
        //   } finally {
        //     setIsLoading(false);
        //   }
        // };
        // checkFollowStatus();

        // Mock response
        setIsFollowing(false);
        setIsLoading(false);
      }, 500);
    }
  }, [userId, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    setIsLoading(true);
    
    // In a real app, call your API
    // const followUser = async () => {
    //   try {
    //     if (isFollowing) {
    //       await axios.delete(`${API_BASE_URL}/users/${userId}/follow`);
    //       setFollowersCount(prev => prev - 1);
    //     } else {
    //       await axios.post(`${API_BASE_URL}/users/${userId}/follow`);
    //       setFollowersCount(prev => prev + 1);
    //     }
    //     setIsFollowing(!isFollowing);
    //   } catch (error) {
    //     console.error('Error toggling follow status:', error);
    //     Alert.alert('Error', 'Failed to update follow status');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // followUser();

    // Mock the API call
    setTimeout(() => {
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      setIsLoading(false);
    }, 500);
  };

  // Open followers/following modal
  const openFollowModal = (tab) => {
    setActiveFollowTab(tab);
    setFollowers(mockFollowers);
    setFollowing(mockFollowing);
    setShowFollowModal(true);
  };

  // Handle following a user from the followers/following list
  const handleFollowUser = (userId) => {
    // In a real app, call your API here
    Alert.alert('Follow', `Following user with ID: ${userId}`);
    
    // Update the UI optimistically
    if (activeFollowTab === 'followers') {
      setFollowers(followers.map(follower => 
        follower.id === userId 
          ? {...follower, isFollowing: true} 
          : follower
      ));
    } else {
      setFollowing(following.map(follow => 
        follow.id === userId 
          ? {...follow, isFollowing: true} 
          : follow
      ));
    }
  };

  // Navigate to a user's profile
  const navigateToProfile = (userId) => {
    setShowFollowModal(false);
    navigation.navigate('Profile', { userId });
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <Text style={styles.postContent}>{item.content}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postTime}>{item.time}</Text>
                  <View style={styles.postStats}>
                    <Ionicons name="heart" size={16} color="#FF6B6B" />
                    <Text style={styles.postStatText}>{item.likes}</Text>
                    <Ionicons name="chatbubble" size={16} color="#4267B2" />
                    <Text style={styles.postStatText}>{item.comments}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        );
      case 'resumes':
        return (
          <FlatList
            data={resumes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.resumeCard}>
                <View style={styles.resumeIcon}>
                  <Ionicons name="document-text" size={24} color="#4267B2" />
                </View>
                <View style={styles.resumeInfo}>
                  <Text style={styles.resumeTitle}>{item.title}</Text>
                  <View style={styles.resumeMeta}>
                    <Text style={styles.resumeDownloads}>{item.downloads} downloads</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.rating}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.resumePrice}>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </View>
            )}
          />
        );
      case 'courses':
        return (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.courseCard}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseInstructor}>Instructor: {item.instructor}</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                  <Text style={styles.progressText}>{item.progress}% completed</Text>
                </View>
              </View>
            )}
          />
        );
      case 'events':
        return (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <View style={styles.eventDateContainer}>
                  <Ionicons name="calendar" size={24} color="#4267B2" />
                  <Text style={styles.eventDate}>{item.date}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <View style={styles.eventLocation}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.eventLocationText}>{item.location}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        );
      default:
        return null;
    }
  };

  // Render a follower or following item
  const renderFollowItem = ({ item }) => (
    <View style={styles.followItem}>
      <TouchableOpacity 
        style={styles.followUserInfo}
        onPress={() => navigateToProfile(item.id)}
      >
        <Image source={item.avatar} style={styles.followAvatar} />
        <View>
          <Text style={styles.followName}>{item.name}</Text>
          <Text style={styles.followRole}>{item.role}</Text>
        </View>
      </TouchableOpacity>
      
      {/* Don't show follow button for the current user */}
      {item.id !== 'current_user_id' && !isOwnProfile && (
        <TouchableOpacity 
          style={[
            styles.smallFollowButton, 
            item.isFollowing && styles.smallFollowingButton
          ]}
          onPress={() => handleFollowUser(item.id)}
        >
          <Text style={styles.smallFollowButtonText}>
            {item.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back button for other user's profiles */}
      {!isOwnProfile && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      )}
      
      <ScrollView>
        <View style={styles.header}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user.role === 'Student' ? '🧑‍🎓 ' : '👨‍🏫 '}{user.role}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{user.rating}</Text>
              </View>
            </View>
            
            {/* Follow stats and button */}
            <View style={styles.followStatsContainer}>
              <TouchableOpacity 
                onPress={() => openFollowModal('followers')}
                style={styles.followStats}
              >
                <Text style={styles.followCount}>{followersCount}</Text>
                <Text style={styles.followLabel}>Followers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openFollowModal('following')}
                style={styles.followStats}
              >
                <Text style={styles.followCount}>{followingCount}</Text>
                <Text style={styles.followLabel}>Following</Text>
              </TouchableOpacity>
              
              {!isOwnProfile && (
                <TouchableOpacity 
                  style={[
                    styles.followButton, 
                    isFollowing && styles.followingButton
                  ]}
                  onPress={handleFollowToggle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.followButtonText}>...</Text>
                  ) : (
                    <Text style={styles.followButtonText}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
        
        <View style={styles.educationSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.educationText}>{user.education}</Text>
        </View>
        
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'resumes' && styles.activeTab]} 
            onPress={() => setActiveTab('resumes')}
          >
            <Text style={[styles.tabText, activeTab === 'resumes' && styles.activeTabText]}>Resumes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'courses' && styles.activeTab]} 
            onPress={() => setActiveTab('courses')}
          >
            <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'events' && styles.activeTab]} 
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Followers/Following Modal */}
      <Modal
        visible={showFollowModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFollowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowFollowModal(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {activeFollowTab === 'followers' ? 'Followers' : 'Following'}
              </Text>
              <View style={{width: 24}} />
            </View>
            
            <View style={styles.followTabContainer}>
              <TouchableOpacity
                style={[
                  styles.followTab,
                  activeFollowTab === 'followers' && styles.activeFollowTab
                ]}
                onPress={() => setActiveFollowTab('followers')}
              >
                <Text 
                  style={[
                    styles.followTabText,
                    activeFollowTab === 'followers' && styles.activeFollowTabText
                  ]}
                >
                  Followers
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.followTab,
                  activeFollowTab === 'following' && styles.activeFollowTab
                ]}
                onPress={() => setActiveFollowTab('following')}
              >
                <Text 
                  style={[
                    styles.followTabText,
                    activeFollowTab === 'following' && styles.activeFollowTabText
                  ]}
                >
                  Following
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={activeFollowTab === 'followers' ? followers : following}
              renderItem={renderFollowItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.followList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginTop: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#E1F5FE',
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#0288D1',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 3,
  },
  followStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  followStats: {
    marginRight: 15,
  },
  followCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  followLabel: {
    fontSize: 12,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#0A66C2',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  followingButton: {
    backgroundColor: '#E1F5FE',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  smallFollowButton: {
    backgroundColor: '#0A66C2',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  smallFollowingButton: {
    backgroundColor: '#E1F5FE',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  smallFollowButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  bioSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  educationSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  educationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  skillsSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#388E3C',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A66C2',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#0A66C2',
    fontWeight: 'bold',
  },
  tabContent: {
    paddingVertical: 10,
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
    marginRight: 10,
  },
  resumeCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  resumeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resumeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  resumeDownloads: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  resumePrice: {
    backgroundColor: '#E1F5FE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  priceText: {
    fontSize: 12,
    color: '#0288D1',
    fontWeight: 'bold',
  },
  courseCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  // Followers modal styles
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
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  followTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  followTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeFollowTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A66C2',
  },
  followTabText: {
    fontSize: 16,
    color: '#666',
  },
  activeFollowTabText: {
    color: '#0A66C2',
    fontWeight: 'bold',
  },
  followList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  followItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  followUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  followName: {
    fontSize: 16,
    fontWeight: '500',
  },
  followRole: {
    fontSize: 14,
    color: '#666',
  },
});

export default Profile;