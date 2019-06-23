import * as firebase from 'firebase';

export const checkUserIfexist = async (currentUid: string) => {
  console.log(currentUid);
  let userExist: boolean;
  await firebase.database().ref().child("users").orderByChild("userID").equalTo(`${currentUid}`).once("value", snapshot => {
      if (snapshot.exists()) {
        userExist = true;
      } else {
        userExist = false;
      }
    });

  return userExist;
};
