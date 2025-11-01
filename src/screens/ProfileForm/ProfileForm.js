// screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { globalstyles } from '../../utils/globalStyles';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { launchImageLibrary } from 'react-native-image-picker';
import { Avatar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { hp } from '../../utils/responsive';
import GradientButton from '../../components/GradientButton/gradientButton';

const ProfileScreen = ({ navigation }) => {
    const [gender, setGender] = useState('male');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageDisplay, setImageDisplay] = useState(null);
    const [items, setItems] = useState([
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
    ]);
    const [date, setDate] = useState(new Date())
    const [openDate, setOpenDate] = useState(false)

    const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        gender: 'male',
        bio: 'Software developer and React Native enthusiast',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    };


    const pickImage = () => {
        setLoading(true); // Show loader when image selection starts
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        // launchImageLibrary(options, response => {
        //     if (response.didCancel) {
        //         setLoading(false); // Hide loader if user cancels
        //     } else if (response.errorCode) {
        //         setLoading(false); // Hide loader if there's an error
        //     } else {
        //         const asset = response.assets[0];

        //         const pickedFileExtension = asset.uri.split('.').pop().toLowerCase();
        //         // Convert file size from bytes to MB

        //         setImageDisplay(asset.uri);
        //         setLoading(false); // Hide loader after image is set
        //     }
        // });
    };
    const handleDateConfirm = (event, selectedDate) => {
        setOpenDate(false);

        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
            setError(''); // Clear any previous errors
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={globalstyles.container}>
                <Text style={[globalstyles.header, globalstyles.centerAlign]}>Fill Your Profile</Text>

                <View style={[globalstyles.profileHeader, globalstyles.alignleft]}>
                    <TouchableOpacity onPress={pickImage} style={globalstyles.avatarContainer}>
                        {imageDisplay ? (
                            <Image source={{ uri: imageDisplay }} style={globalstyles.avatar} />
                        ) : (
                            <View style={globalstyles.avatarPlaceholder}>
                                <MaterialIcons name="person" size={40} color="#fff" />
                                {/* <Avatar.Icon size={24} icon="user" /> */}
                            </View>
                        )}
                        <View style={globalstyles.cameraIcon}>
                            <MaterialIcons name="photo-camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={globalstyles.input}
                    placeholder="First Name"
                    placeholderTextColor={"#ccc"}
                />

                <TextInput
                    style={globalstyles.input}
                    placeholder="Last Name"
                    placeholderTextColor={"#ccc"}
                />

                <TextInput
                    style={globalstyles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    placeholderTextColor={"#ccc"}
                />

                <View style={[{ justifyContent: 'center' }]}>
                    <DropDownPicker
                        open={open}
                        value={gender}
                        items={items}
                        setOpen={setOpen}
                        setValue={setGender}
                        setItems={setItems}
                        style={globalstyles.input}
                        placeholder="Select Gender"
                        placeholderTextColor={"#ccc"}
                    />
                </View>

                <View style={{ marginBottom: hp("2%") }}>
                    <TouchableOpacity onPress={() => setOpenDate(true)}>
                        <TextInput
                            style={globalstyles.input}
                            placeholder="Select date"
                            editable={false}
                            value={format(date, 'MM/dd/yyyy')}
                            pointerEvents="none"
                        />
                    </TouchableOpacity>

                    {error ? <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text> : null}


                    {openDate && (
                         <DateTimePicker
                            value={date || new Date()}
                            mode="date"
                            maximumDate={new Date()} // This prevents future dates in the picker
                            onChange={handleDateConfirm}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        />
                    )}

                </View>

                <GradientButton
                    colors={['#BA000C', '#5E000B']}
                    text="Continue"
                    onPress={() => navigation.navigate("Dashboard")}
                />
            </View>
        </View>
    );
};

export default ProfileScreen;