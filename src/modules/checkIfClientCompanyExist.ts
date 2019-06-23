import * as firebase from 'firebase';

export const checkIfClientCompanyExist = async (company: string) => {
  console.log(company);
  let userExist: boolean;
  await firebase.database().ref().child("clients").orderByChild("Company").equalTo(`${company}`).once("value", snapshot => {
      if (snapshot.exists()) {
        userExist = true;
      } else {
      userExist = false;
    }
    });

  return userExist;
};
