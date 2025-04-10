import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

const UniversityProfile = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [university, setUniversity] = useState(null);
    const [activeTab, setActiveTab] = useState('about');
    const [newsItems, setNewsItems] = useState([]);
    
    // Get university data based on ID
    useEffect(() => {
        if (route.params?.universityId && universitiesData && universitiesData.universities) {
            const uniId = route.params.universityId;
            const foundUniversity = universitiesData.universities[uniId - 1];
            
            if (foundUniversity) {
                setUniversity({
                    id: uniId,
                    name: foundUniversity.name || 'University',
                    location: foundUniversity.location || '',
                    description: foundUniversity.description || '',
                    logo: 'logo',
                    website: foundUniversity.url || '',
                    faculties: foundUniversity.faculties || [],
                    departments: foundUniversity.departments || [],
                    establishedYear: foundUniversity.establishedYear || 'Unknown',
                    students: foundUniversity.students || 'Unknown',
                    motto: foundUniversity.motto || ''
                });
                
                // Set news items
                if (foundUniversity.news && Array.isArray(foundUniversity.news)) {
                    const uniNews = foundUniversity.news.map((news, index) => ({
                        id: `${uniId}-${index}`,
                        title: news.title || 'University News',
                        content: news.content || 'No content available',
                        timeAgo: news.date || 'Recently',
                        image: news.image || '',
                    }));
                    setNewsItems(uniNews);
                }
            }
        }
    }, [route.params?.universityId]);

    if (!university) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading university profile...</Text>
            </View>
        );
    }

    // Render news item
    const renderNewsItem = ({ item }) => (
        <View style={styles.newsCard}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
            <Text style={styles.newsDate}>{item.timeAgo}</Text>
        </View>
    );
    
    // Render faculty item
    const renderFacultyItem = ({ item }) => (
        <View style={styles.facultyCard}>
            <Icon name="school" size={24} color="#0A66C2" />
            <View style={styles.facultyInfo}>
                <Text style={styles.facultyName}>{item}</Text>
            </View>
        </View>
    );
    
    // Render department item
    const renderDepartmentItem = ({ item }) => (
        <View style={styles.departmentItem}>
            <Icon name="office-building" size={20} color="#666" />
            <Text style={styles.departmentName}>{item}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            
            <ScrollView>
                <View style={styles.header}>
                    <Image 
                        source={getUniversityLogo(university.name)} 
                        style={styles.logo} 
                    />
                    <View style={styles.headerInfo}>
                        <Text style={styles.universityName}>{university.name}</Text>
                        {university.location && (
                            <View style={styles.locationContainer}>
                                <Icon name="map-marker" size={16} color="#666" />
                                <Text style={styles.locationText}>{university.location}</Text>
                            </View>
                        )}
                        {university.website && (
                            <TouchableOpacity style={styles.websiteButton}>
                                <Text style={styles.websiteText}>{university.website}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                
                <View style={styles.infoCards}>
                    <View style={styles.infoCard}>
                        <Icon name="calendar" size={24} color="#0A66C2" />
                        <Text style={styles.infoLabel}>Established</Text>
                        <Text style={styles.infoValue}>{university.establishedYear}</Text>
                    </View>
                    
                    <View style={styles.infoCard}>
                        <Icon name="account-group" size={24} color="#0A66C2" />
                        <Text style={styles.infoLabel}>Students</Text>
                        <Text style={styles.infoValue}>{university.students}</Text>
                    </View>
                    
                    <View style={styles.infoCard}>
                        <Icon name="school" size={24} color="#0A66C2" />
                        <Text style={styles.infoLabel}>Faculties</Text>
                        <Text style={styles.infoValue}>{university.faculties?.length || 0}</Text>
                    </View>
                </View>
                
                {university.motto && (
                    <View style={styles.mottoContainer}>
                        <Text style={styles.mottoLabel}>MOTTO</Text>
                        <Text style={styles.mottoText}>"{university.motto}"</Text>
                    </View>
                )}
                
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'faculties' && styles.activeTab]} 
                        onPress={() => setActiveTab('faculties')}
                    >
                        <Text style={[styles.tabText, activeTab === 'faculties' && styles.activeTabText]}>Faculties</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'departments' && styles.activeTab]} 
                        onPress={() => setActiveTab('departments')}
                    >
                        <Text style={[styles.tabText, activeTab === 'departments' && styles.activeTabText]}>Departments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'news' && styles.activeTab]} 
                        onPress={() => setActiveTab('news')}
                    >
                        <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>News</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.tabContent}>
                    {activeTab === 'about' && (
                        <View style={styles.aboutContainer}>
                            <Text style={styles.sectionTitle}>About {university.name}</Text>
                            <Text style={styles.descriptionText}>{university.description || 'No description available for this university.'}</Text>
                        </View>
                    )}
                    
                    {activeTab === 'faculties' && (
                        <View style={styles.facultiesContainer}>
                            <Text style={styles.sectionTitle}>Faculties</Text>
                            {university.faculties && university.faculties.length > 0 ? (
                                <FlatList
                                    data={university.faculties}
                                    renderItem={renderFacultyItem}
                                    keyExtractor={(item, index) => `faculty-${index}`}
                                    scrollEnabled={false}
                                />
                            ) : (
                                <Text style={styles.emptyText}>No faculties information available.</Text>
                            )}
                        </View>
                    )}
                    
                    {activeTab === 'departments' && (
                        <View style={styles.departmentsContainer}>
                            <Text style={styles.sectionTitle}>Departments</Text>
                            {university.departments && university.departments.length > 0 ? (
                                <View style={styles.departmentsList}>
                                    {university.departments.map((dept, index) => (
                                        <View key={`dept-${index}`} style={styles.departmentItem}>
                                            <Icon name="office-building" size={20} color="#666" />
                                            <Text style={styles.departmentName}>{dept}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>No departments information available.</Text>
                            )}
                        </View>
                    )}
                    
                    {activeTab === 'news' && (
                        <View style={styles.newsContainer}>
                            <Text style={styles.sectionTitle}>Latest News</Text>
                            {newsItems && newsItems.length > 0 ? (
                                <FlatList
                                    data={newsItems}
                                    renderItem={renderNewsItem}
                                    keyExtractor={item => item.id}
                                    scrollEnabled={false}
                                />
                            ) : (
                                <Text style={styles.emptyText}>No news available for this university.</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#FFFFFF',
        marginTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    headerInfo: {
        marginLeft: 15,
        flex: 1,
        justifyContent: 'center',
    },
    universityName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    websiteButton: {
        backgroundColor: '#E1F5FE',
        borderRadius: 15,
        paddingVertical: 3,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
    },
    websiteText: {
        fontSize: 12,
        color: '#0A66C2',
    },
    infoCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    mottoContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    mottoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    mottoText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#333',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
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
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    aboutContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    facultiesContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    facultyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    facultyInfo: {
        marginLeft: 15,
    },
    facultyName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    departmentsContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    departmentsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    departmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        padding: 10,
    },
    departmentName: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    newsContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    newsCard: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    newsContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    newsDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default UniversityProfile; 