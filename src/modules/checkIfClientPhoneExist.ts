import * as firebase from 'firebase';

export const checkIfClientPhoneExist = async (phone: string) => {
  console.log(phone);
  let userExist: boolean;
  await firebase.database().ref().child("clients").orderByChild("phoneNumber").equalTo(`${phone}`).once("value", snapshot => {
      if (snapshot.exists()) {
        userExist = true;
      } else {
      userExist = false;
    }
    });

  return userExist;
};
