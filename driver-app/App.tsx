import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Truck, Smartphone, Lock, Wallet, Bell, Menu, Search, MapPin } from 'lucide-react-native';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Animated, ScrollView, Modal, Alert } from 'react-native';

// ⚠️ REPLACE WITH YOUR LAPTOP'S IP ADDRESS
const API_URL = "http://10.99.18.78:3000/api/mobile"; 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"LOGIN" | "REGISTRATION" | "DASHBOARD">("LOGIN");
  const [userStatus, setUserStatus] = useState<"NEW" | "PENDING" | "APPROVED">("NEW");
  const [myFleet, setMyFleet] = useState<any[]>([]);
  const [availableLoads, setAvailableLoads] = useState<any[]>([]); 

  // LOGIN STATE
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"LOADS" | "TRIPS" | "WALLET" | "FLEET">("LOADS");

  // ANIMATIONS
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // BIDDING STATE
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [myBid, setMyBid] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true })
    ]).start();
  }, []);

  // --- API HELPER ---
  const apiCall = async (body: any) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (error) {
      console.log(error); // Log error for debugging
      return null;
    }
  };

  // --- 5. CHECK USER STATUS (SYNC BUG FIXED) ---
  const checkUserStatus = async () => {
    if (!phone) return;
    
    // Silent API call
    const res = await apiCall({ action: 'VERIFY_OTP', phone, otp: '1234' });
    
    if (res?.success) {
      // FIX: Removed the "if (status !== status)" check.
      // Now it ALWAYS updates, so you see approved trucks instantly!
      setUserStatus(res.user.status);
      setMyFleet(res.user.fleet); 
    }
  };

  // Run this AUTOMATICALLY when "currentScreen" changes to DASHBOARD
  useEffect(() => {
    if (currentScreen === "DASHBOARD") {
      checkUserStatus();
    }
  }, [currentScreen]);

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async () => {
    if (step === "PHONE" && phone.length < 10) { 
       Alert.alert("Error", "Please enter a valid phone number");
       return; 
    }
    if (step === "OTP" && otp.length < 4) { 
       Alert.alert("Error", "Please enter valid OTP");
       return;
    }
    setLoading(true);
    
    if (step === "PHONE") {
      const res = await apiCall({ action: 'SEND_OTP', phone });
      setLoading(false);
      if (res?.success) setStep("OTP");
    } else {
      const res = await apiCall({ action: 'VERIFY_OTP', phone, otp });
      setLoading(false);
      
      if (res?.success) {
        setUserStatus(res.user.status);
        setMyFleet(res.user.fleet);
        
        if (res.user.status === "NEW") {
          setCurrentScreen("REGISTRATION");
        } else {
          fetchLoads(); 
          setCurrentScreen("DASHBOARD");
        }
      } else {
        Alert.alert("Error", "Invalid OTP");
      }
    }
  };

  // --- 2. FETCH LOADS ---
  const fetchLoads = async () => {
    const res = await apiCall({ action: 'GET_LOADS' });
    if (res?.success) setAvailableLoads(res.loads);
  };

  // --- 3. HANDLE REGISTRATION ---
  const submitDocuments = async () => {
    setLoading(true);
    const res = await apiCall({ action: 'REGISTER', phone });
    setLoading(false);
    
    if (res?.success) {
      Alert.alert("Success", "Documents submitted for verification!");
      setUserStatus("PENDING");
      fetchLoads();
      setCurrentScreen("DASHBOARD");
    }
  };

  // --- 4. STRICT BIDDING LOGIC ---
  const openBidModal = (load: any) => {
    if (userStatus !== "APPROVED") {
      Alert.alert("Access Denied 🔒", "Your account is pending verification. You cannot bid yet.");
      return;
    }
    
    const loadWeight = parseInt(load.weight);
    
    const capableTruck = myFleet.find(truck => {
      const truckCapacity = typeof truck.capacity === 'string' 
          ? parseInt(truck.capacity) 
          : truck.capacity;
          
      return truckCapacity >= loadWeight;
    });

    if (!capableTruck) {
      Alert.alert("Truck Too Small 🚛", `This load requires ${load.weight}. Your verified trucks are not big enough.`);
      return;
    }

    setSelectedLoad(load);
    setMyBid(load.price.replace('₹', '').replace(',', ''));
    setModalVisible(true);
  };

  const submitBid = async () => {
    setLoading(true);
    const res = await apiCall({ action: 'PLACE_BID', phone, loadId: selectedLoad.id, bidAmount: myBid });
    setLoading(false);
    
    if (res?.success) {
      setModalVisible(false);
      Alert.alert("Bid Placed ✅", `Success! You bid ₹${myBid}.`);
    }
  };

  // --- SCREENS ---
  const RegistrationScreen = () => (
    <View style={styles.container}>
      <View style={[styles.header, { height: 140, justifyContent: 'flex-end', paddingBottom: 30 }]}>
        <Text style={{color:'white', fontSize: 22, fontWeight: 'bold'}}>Partner Verification</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#ea580c' }}>
        <ScrollView style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 }}>
          <Text style={styles.sectionTitle}>Complete Your Profile</Text>
          <Text style={{color: '#64748b', marginBottom: 20}}>Verify your identity to start bidding.</Text>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput style={[styles.inputBox, {height: 50, fontSize: 16}]} placeholder="Enter name" />
          <Text style={styles.inputLabel}>AADHAR NUMBER</Text>
          <TextInput style={[styles.inputBox, {height: 50, fontSize: 16}]} placeholder="XXXX-XXXX-XXXX" keyboardType="number-pad" />
          <TouchableOpacity onPress={submitDocuments} disabled={loading} style={[styles.button, loading && {backgroundColor:'#cbd5e1'}]}>
             {loading ? <ActivityIndicator color="white"/> : <Text style={styles.buttonText}>Submit Documents</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const Dashboard = () => {
    const [searchText, setSearchText] = useState("");
    const filteredLoads = availableLoads.filter(load => 
      load.from.toLowerCase().includes(searchText.toLowerCase()) || 
      load.to.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <View style={styles.dashContainer}>
        <StatusBar style="light" />
        <View style={{ flex: 1, paddingBottom: 80 }}> 
          <View style={styles.dashHeader}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.menuBtn} onPress={() => Alert.alert("Menu", "Profile, Settings, and History will go here.")}>
                 <Menu color="white" size={24} />
              </TouchableOpacity>
              <View>
                 <Text style={styles.welcomeText}>Welcome back,</Text>
                 <Text style={styles.userName}>Ramesh Transports</Text>
              </View>
              <TouchableOpacity style={styles.notifBtn} onPress={() => Alert.alert("Notifications", "You have 3 new load alerts.")}>
                 <Bell color="white" size={24} />
                 <View style={styles.redDot} />
              </TouchableOpacity>
            </View>
            {currentTab === "LOADS" && (
              <View style={styles.searchBar}>
                 <Search color="#94a3b8" size={20} />
                 <TextInput placeholder="Search (e.g. Mumbai)" placeholderTextColor="#94a3b8" style={styles.searchInput} value={searchText} onChangeText={setSearchText} />
              </View>
            )}
          </View>

          {currentTab === "LOADS" && (
              <ScrollView showsVerticalScrollIndicator={false}>
                 {userStatus === "PENDING" && (
                   <View style={{ backgroundColor: '#fff7ed', margin: 20, marginBottom: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fdba74', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Lock color="#ea580c" size={24} />
                      <View style={{flex: 1}}><Text style={{fontWeight: 'bold', color: '#9a3412'}}>Verification Pending</Text><Text style={{fontSize: 12, color: '#c2410c'}}>Bidding disabled until approval.</Text></View>
                   </View>
                 )}
                 <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Live Loads ({filteredLoads.length})</Text>
                 </View>
                 {filteredLoads.map((load) => (
                   <View key={load.id} style={styles.loadCard}>
                      <View style={styles.loadHeader}><View style={styles.badge}><Text style={styles.badgeText}>{load.type}</Text></View><Text style={styles.price}>{load.price}</Text></View>
                      <View style={styles.routeRow}>
                         <View style={styles.routeNode}><View style={styles.dot} /><View style={styles.line} /><View style={[styles.dot, { backgroundColor: '#ea580c' }]} /></View>
                         <View style={styles.routeText}><Text style={styles.city}>{load.from}</Text><Text style={styles.city}>{load.to}</Text></View>
                      </View>
                      <View style={styles.loadFooter}>
                         <View style={styles.infoItem}><Truck size={14} color="#64748b" /><Text style={styles.infoText}>{load.weight}</Text></View>
                         <TouchableOpacity style={styles.bidButton} onPress={() => openBidModal(load)}><Text style={styles.bidButtonText}>Bid Now</Text></TouchableOpacity>
                      </View>
                   </View>
                 ))}
              </ScrollView>
          )}
          {currentTab === "TRIPS" && <View style={{padding:20}}><Text>Trips Screen</Text></View>}
          {currentTab === "WALLET" && <View style={{padding:20}}><Text>Wallet Screen</Text></View>}
          {currentTab === "FLEET" && <FleetScreen />}
        </View>

        <View style={styles.bottomNav}>
           <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("LOADS")}><Truck color={currentTab==="LOADS"?"#0f172a":"#94a3b8"} size={24} /><Text style={styles.navText}>Loads</Text></TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("TRIPS")}><MapPin color={currentTab==="TRIPS"?"#0f172a":"#94a3b8"} size={24} /><Text style={styles.navText}>Trips</Text></TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("WALLET")}><Wallet color={currentTab==="WALLET"?"#0f172a":"#94a3b8"} size={24} /><Text style={styles.navText}>Wallet</Text></TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab("FLEET")}><Truck color={currentTab==="FLEET"?"#0f172a":"#94a3b8"} size={24} /><Text style={styles.navText}>Fleet</Text></TouchableOpacity>
        </View>

        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}><Text style={styles.modalTitle}>Place Your Bid</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeText}>Close</Text></TouchableOpacity></View>
              {selectedLoad && (
                <View>
                   <Text style={{color:'#64748b', fontWeight:'bold', fontSize:12}}>CLIENT PRICE</Text>
                   <Text style={styles.modalPrice}>{selectedLoad.price}</Text>
                   
                   <Text style={{color:'#64748b', fontWeight:'bold', fontSize:12, marginTop:10}}>YOUR OFFER (Edit this)</Text>
                   <View style={styles.bidInputBox}><Text style={styles.currencySymbol}>₹</Text><TextInput style={styles.bidInput} value={myBid} onChangeText={setMyBid} keyboardType="number-pad" autoFocus /></View>
                   
                   <TouchableOpacity style={styles.submitButton} onPress={submitBid} disabled={loading}>{loading ? <ActivityIndicator color="white"/> : <Text style={styles.submitButtonText}>Submit Bid</Text>}</TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const FleetScreen = () => {
    const [newTruckNum, setNewTruckNum] = useState("");
    const [newTruckCap, setNewTruckCap] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTruck = async () => {
      if (!newTruckNum || !newTruckCap) return Alert.alert("Error", "Fill all details");
      setLoading(true);
      
      const res = await apiCall({ 
        action: 'ADD_TRUCK', 
        truckNumber: newTruckNum, 
        capacity: newTruckCap,
        phone: phone
      });
      
      setLoading(false);

      if (res?.success) {
        Alert.alert("Success", "Truck added! Waiting for Help Desk approval.");
        setMyFleet([...myFleet, res.truck]); 
        setIsAdding(false);
        setNewTruckNum("");
        setNewTruckCap("");
      }
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#f1f5f9', padding: 20 }}>
         <Text style={styles.sectionTitle}>My Trucks ({myFleet.length})</Text>
         <ScrollView showsVerticalScrollIndicator={false}>
            {myFleet.map((truck) => (
              <View key={truck.id} style={styles.loadCard}>
                 <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View>
                       <Text style={styles.price}>{truck.number}</Text>
                       <Text style={styles.city}>{truck.capacity} Ton Capacity</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: truck.status === 'APPROVED' ? '#dcfce7' : '#fff7ed' }]}>
                       <Text style={{ fontWeight:'bold', color: truck.status === 'APPROVED' ? '#16a34a' : '#ea580c' }}>{truck.status}</Text>
                    </View>
                 </View>
              </View>
            ))}
            {!isAdding ? (
               <TouchableOpacity onPress={() => setIsAdding(true)} style={[styles.button, {marginTop: 20, flexDirection:'row', gap: 10}]}>
                  <Text style={styles.buttonText}>+ Add New Truck</Text>
               </TouchableOpacity>
            ) : (
               <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, marginTop: 20 }}>
                  <Text style={styles.inputLabel}>TRUCK NUMBER</Text>
                  <TextInput style={[styles.inputBox, {height: 50}]} placeholder="HR-55-X-0000" value={newTruckNum} onChangeText={setNewTruckNum} />
                  <Text style={styles.inputLabel}>CAPACITY (TONS)</Text>
                  <TextInput style={[styles.inputBox, {height: 50}]} placeholder="e.g. 18" keyboardType="number-pad" value={newTruckCap} onChangeText={setNewTruckCap} />
                  <View style={{flexDirection:'row', gap: 10}}>
                     <TouchableOpacity onPress={() => setIsAdding(false)} style={{flex:1, padding:15, alignItems:'center'}}><Text style={{fontWeight:'bold', color:'#94a3b8'}}>Cancel</Text></TouchableOpacity>
                     <TouchableOpacity onPress={handleAddTruck} style={{flex:1, backgroundColor:'#0f172a', padding:15, borderRadius: 12, alignItems:'center'}}><Text style={{color:'white', fontWeight:'bold'}}>Save Truck</Text></TouchableOpacity>
                  </View>
               </View>
            )}
         </ScrollView>
      </View>
    );
  };

  if (currentScreen === "REGISTRATION") return <RegistrationScreen />;
  if (currentScreen === "DASHBOARD") return <Dashboard />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}><View style={styles.logoCircle}><Truck size={60} color="white" /></View></View>
      <View style={styles.content}>
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.label}>PARTNER PORTAL</Text>
          <Text style={styles.title}>{step === "PHONE" ? "Truck Owner Login" : "Verify OTP"}</Text>
          {step === "PHONE" ? (
             <View style={styles.inputBox}><Smartphone size={20} color="#94a3b8" /><Text style={styles.prefix}>+91</Text><TextInput style={styles.input} placeholder="98765 43210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={15} /></View>
          ) : (
             <View style={styles.inputBox}><Lock size={20} color="#94a3b8" /><TextInput style={styles.input} placeholder="1 2 3 4" keyboardType="number-pad" value={otp} onChangeText={setOtp} maxLength={6} /></View>
          )}
          <TouchableOpacity onPress={handleLogin} disabled={loading} style={[styles.button, loading && { backgroundColor: '#cbd5e1' }]}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{step === "PHONE" ? "Get OTP" : "Verify Login"}</Text>}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { height: '45%', backgroundColor: '#ea580c', borderBottomLeftRadius: 50, borderBottomRightRadius: 50, alignItems: 'center', justifyContent: 'center' },
  logoCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 30, borderRadius: 100, marginBottom: 40 },
  content: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 50 },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  label: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, letterSpacing: 2, marginBottom: 5 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 20 },
  prefix: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginLeft: 10, marginRight: 10 },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  button: { backgroundColor: '#0f172a', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: "#ea580c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  inputLabel: { color: '#64748b', fontWeight: 'bold', fontSize: 11, marginBottom: 8, marginLeft: 4 },
  dashContainer: { flex: 1, backgroundColor: '#f1f5f9' },
  dashHeader: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#0f172a', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  notifBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, position: 'relative' },
  redDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 },
  welcomeText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  userName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 15, height: 50, marginTop: 20 },
  searchInput: { flex: 1, color: 'white', marginLeft: 10, fontWeight: '500', fontSize: 16 },
  loadCard: { backgroundColor: 'white', marginHorizontal: 20, marginBottom: 15, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  loadHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  badge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#0284c7', fontWeight: 'bold', fontSize: 12 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  routeRow: { flexDirection: 'row', marginBottom: 20 },
  routeNode: { alignItems: 'center', marginRight: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#64748b' },
  line: { width: 2, height: 30, backgroundColor: '#e2e8f0', marginVertical: 4 },
  routeText: { justifyContent: 'space-between', height: 60 },
  city: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  loadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  bidButton: { backgroundColor: '#0f172a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  bidButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 15, paddingHorizontal: 30, justifyContent: 'space-between', position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  navItem: { alignItems: 'center' },
  navText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, minHeight: 450 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  closeText: { color: '#64748b', fontWeight: 'bold' },
  modalPrice: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 25 },
  bidInputBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ea580c', paddingBottom: 10, marginBottom: 30 },
  currencySymbol: { fontSize: 32, fontWeight: 'bold', color: '#ea580c', marginRight: 10 },
  bidInput: { flex: 1, fontSize: 32, fontWeight: 'bold', color: '#ea580c' },
  submitButton: { backgroundColor: '#0f172a', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, borderRadius: 16, gap: 10 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});