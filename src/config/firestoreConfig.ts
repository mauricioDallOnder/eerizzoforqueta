import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDemda3V4atRbz_CoiYXy3iNBXl78F-vFE",

  authDomain: "backend-91edf.firebaseapp.com",

  databaseURL: "https://backend-91edf-default-rtdb.firebaseio.com",

  projectId: "backend-91edf",

  storageBucket: "backend-91edf.appspot.com",

  messagingSenderId: "704857852469",

  appId: "1:704857852469:web:ed525a312cb665f13ebf7c",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


/*
 apiKey: "AIzaSyBledGNleg5J7lKVqzMHRlguJi3k0Lyw5E",

  authDomain: "bcoescolinha.firebaseapp.com",

  databaseURL: "https://bcoescolinha-default-rtdb.firebaseio.com",

  projectId: "bcoescolinha",

  storageBucket: "bcoescolinha.appspot.com",

  messagingSenderId: "270520861913",

  appId: "1:270520861913:web:291b6e1947d383c821aac8"

*/