import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Dummy data for resumes
const dummyResumes = [
  {
    id: '1',
    user: {
      name: 'Ahmed Hassan',
      avatar: require('../assets/images/logo.png'),
      isTeacher: false,
    },
    title: 'UX Designer Resume',
    skills: ['Figma', 'UI/UX', 'Adobe XD'],
    rating: 4.8,
    reviews: 120,
    price: 150,
    field: 'Design',
    experienceLevel: 'Mid-level',
  },
  {
    id: '2',
    user: {
      name: 'Sara Mansour',
      avatar: require('../assets/images/logo.png'),
      isTeacher: true,
    },
    title: 'Full Stack Developer CV',
    skills: ['React', 'Node.js', 'MongoDB'],
    rating: 4.9,
    reviews: 85,
    price: 0,
    field: 'Engineering',
    experienceLevel: 'Senior',
  },
  {
    id: '3',
    user: {
      name: 'Omar Farouk',
      avatar: require('../assets/images/logo.png'),
      isTeacher: false,
    },
    title: 'Marketing Specialist Resume',
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    rating: 4.6,
    reviews: 64,
    price: 300,
    field: 'Marketing',
    experienceLevel: 'Entry-level',
  },
];

// Dummy data for courses
const dummyCourses = [
  {
    id: '1',
    title: 'AI in Education',
    instructor: 'Prof. John Doe',
    bannerImage: require('../assets/images/logo.png'),
    duration: '6 weeks',
    rating: 4.9,
    reviews: 230,
    price: 0,
    topic: 'Technology',
    university: 'MIT',
  },
  {
    id: '2',
    title: 'Modern Web Development',
    instructor: 'Dr. Sarah Ahmed',
    bannerImage: require('../assets/images/logo.png'),
    duration: '8 weeks',
    rating: 4.7,
    reviews: 185,
    price: 250,
    topic: 'Programming',
    university: 'Stanford',
  },
  {
    id: '3',
    title: 'Introduction to UX Research',
    instructor: 'Prof. Layla Mahmoud',
    bannerImage: require('../assets/images/logo.png'),
    duration: '4 weeks',
    rating: 4.8,
    reviews: 142,
    price: 150,
    topic: 'Design',
    university: 'Harvard',
  },
];

// Dummy data for saved items
const dummySavedItems = [
  {
    id: '1',
    type: 'resume',
    data: dummyResumes[0],
  },
  {
    id: '2',
    type: 'course',
    data: dummyCourses[1],
  },
];

const Marketplace = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('resumes');
  const [searchQuery, setSearchQuery] = useState('');

  // Resume filters
  const [resumeFilters, setResumeFilters] = useState({
    field: '',
    experienceLevel: '',
    rating: 0,
    isPaid: null,
  });

  // Course filters
  const [courseFilters, setCourseFilters] = useState({
    topic: '',
    university: '',
    duration: '',
    isPaid: null,
    rating: 0,
  });

  // Render resume card
  const renderResumeCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={item.user.avatar} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badge, item.user.isTeacher ? styles.teacherBadge : styles.studentBadge]}>
              {item.user.isTeacher ? 'Teacher' : 'Student'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.cardTitle}>{item.title}</Text>
      
      <View style={styles.skillsContainer}>
        {item.skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.ratingContainer}>
        <Icon name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating} ({item.reviews} reviews)</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>
          {item.price === 0 ? 'Free' : `Dzd${item.price}`}
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.previewButton}>
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>
            {item.price === 0 ? 'Download' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render course card
  const renderCourseCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.bannerImage} style={styles.courseBanner} />
      
      <Text style={styles.cardTitle}>{item.title}</Text>
      
      <View style={styles.instructorContainer}>
        <Text style={styles.instructorText}>Instructor: {item.instructor}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>Verified</Text>
        </View>
      </View>
      
      <View style={styles.courseDetails}>
        <View style={styles.detailItem}>
          <Icon name="clock-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.detailText}>{item.rating} ({item.reviews})</Text>
        </View>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>
          {item.price === 0 ? 'Free' : `$${item.price}`}
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.previewButton}>
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>
            {item.price === 0 ? 'Enroll' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render saved item
  const renderSavedItem = ({ item }) => {
    if (item.type === 'resume') {
      return renderResumeCard({ item: item.data });
    } else {
      return renderCourseCard({ item: item.data });
    }
  };

  // Render Resume Filters
  const renderResumeFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Filters</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Field</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Experience level</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Rating</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Price</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
  
  // Render Course Filters
  const renderCourseFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Filters</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScrollView}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Topic</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>University</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Duration</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Price</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Rating</Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resumes' && styles.activeTab]}
          onPress={() => setActiveTab('resumes')}
        >
          <Icon name="file-document-outline" size={20} color={activeTab === 'resumes' ? '#0077B5' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'resumes' && styles.activeTabText]}>Resumes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Icon name="school-outline" size={20} color={activeTab === 'courses' ? '#0077B5' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>Courses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Icon name="heart-outline" size={20} color={activeTab === 'saved' ? '#0077B5' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {activeTab === 'resumes' && (
        <View style={styles.contentContainer}>
          {/* Publish Resume Button */}
          <TouchableOpacity
            style={styles.publishButton}
            onPress={() => navigation.navigate('PublishResume')} // Navigate to the Publish Resume screen
          >
            <Icon name="plus-circle" size={20} color="#FFFFFF" />
            <Text style={styles.publishButtonText}>Publish Resume</Text>
          </TouchableOpacity>

          {renderResumeFilters()}
          <FlatList
            data={dummyResumes}
            renderItem={renderResumeCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
      
      {activeTab === 'courses' && (
        <View style={styles.contentContainer}>
          {renderCourseFilters()}
          <FlatList
            data={dummyCourses}
            renderItem={renderCourseCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
      
      {activeTab === 'saved' && (
        <View style={styles.contentContainer}>
          <Text style={styles.savedTitle}>Your Saved Items</Text>
          <FlatList
            data={dummySavedItems}
            renderItem={renderSavedItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2EF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3F8',
    paddingHorizontal: 10,
    borderRadius: 4,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 5,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0077B5',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#0077B5',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filtersScrollView: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 12,
    marginRight: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  badge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  teacherBadge: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
  },
  studentBadge: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillBadge: {
    backgroundColor: '#F3F2EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    marginBottom: 15,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B5',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0077B5',
    borderRadius: 4,
    marginRight: 8,
  },
  previewButtonText: {
    color: '#0077B5',
    fontWeight: 'bold',
  },
  buyButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#0077B5',
    borderRadius: 4,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  courseBanner: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginBottom: 10,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructorText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  courseDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077B5',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Marketplace;