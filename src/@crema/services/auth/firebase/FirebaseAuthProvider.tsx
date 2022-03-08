import React, {createContext, ReactNode, useContext, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  auth,
  facebookAuthProvider,
  githubAuthProvider,
  googleAuthProvider,
  twitterAuthProvider,
} from './firebase';
import {AuthUser} from '../../../../types/models/AuthUser';
import {fetchError, fetchStart, fetchSuccess} from '../../../../redux/actions';
import Utility from 'helper/Utility';
import { useSnackbar } from 'notistack';

interface FirebaseContextProps {
  user: AuthUser | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SignUpProps {
  name: string;
  email: string;
  password: string;
}

interface SignInProps {
  email: string;
  password: string;
}

interface FirebaseActionsProps {
  createUserWithEmailAndPassword: (data: SignUpProps) => void;
  signInWithEmailAndPassword: (data: SignInProps) => void;
  signInWithPopup: (type: string) => void;
  logout: () => void;
}

const FirebaseContext = createContext<FirebaseContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});
const FirebaseActionsContext = createContext<FirebaseActionsProps>({
  createUserWithEmailAndPassword: () => {},
  signInWithEmailAndPassword: () => {},
  signInWithPopup: () => {},
  logout: () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseActions = () => useContext(FirebaseActionsContext);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({
  children,
}) => {
  const [firebaseData, setFirebaseData] = useState<FirebaseContextProps>({
    user: null,
    isLoading: false,
    isAuthenticated: true,
  });
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const getAuthUser = auth.onAuthStateChanged(
  //     (user) => {
  //       setFirebaseData({
  //         user: user as AuthUser,
  //         isAuthenticated: Boolean(user),
  //         isLoading: false,
  //       });
  //     },
  //     () => {
  //       setFirebaseData({
  //         user: firebaseData.user,
  //         isLoading: false,
  //         isAuthenticated: false,
  //       });
  //     },
  //     () => {
  //       setFirebaseData({
  //         user: firebaseData.user,
  //         isLoading: false,
  //         isAuthenticated: true,
  //       });
  //     }
  //   );
  //
  //   return () => {
  //     getAuthUser();
  //   };
  // }, [firebaseData.user]);

  const { enqueueSnackbar } = useSnackbar();

  const getProvider = (providerName: string) => {
    switch (providerName) {
      case 'google': {
        return googleAuthProvider;
      }
      case 'facebook': {
        return facebookAuthProvider;
      }
      case 'twitter': {
        return twitterAuthProvider;
      }
      case 'github': {
        return githubAuthProvider;
      }
      default:
        return googleAuthProvider;
    }
  };

  const signInWithPopup = async (providerName: string) => {
    console.log("signInWithPopup", providerName);

    dispatch(fetchStart());
    try {
      const {user} = await auth.signInWithPopup(getProvider(providerName));
      setFirebaseData({
        user: user as AuthUser,
        isAuthenticated: true,
        isLoading: false,
      });
      dispatch(fetchSuccess());
    } catch ({message}) {
      setFirebaseData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      dispatch(fetchError(message as string));
    }
  };

  const signInWithEmailAndPassword = async ({email, password}: SignInProps) => {
    console.log("signInWithEmailAndPassword", email, password);

    // console.log('1');
    // dispatch(fetchStart());
    // console.log('2');
    // try {
    //   const {user} = await auth.signInWithEmailAndPassword(email, password);
    //   setFirebaseData({
    //     user: user as AuthUser,
    //     isAuthenticated: true,
    //     isLoading: false,
    //   });
    //   console.log('3');
    //   dispatch(fetchSuccess());
    // } catch ({message}) {
    //   setFirebaseData({
    //     ...firebaseData,
    //     isAuthenticated: false,
    //     isLoading: false,
    //   });
    //   dispatch(fetchError(message as string));
    // }

    const { query: ip } = await (await fetch('http://ip-api.com/json/?lang=zh-CN')).json();
    const result = await Utility.request({ url: '/api/login', data: { email, password, ip }, method: "POST" });
    if (result.errMsg) {
      enqueueSnackbar(result.errMsg, { variant: "error" })
      return;
    }

    if(!result.nickname) {
      enqueueSnackbar("用户不存在或密码错误", { variant: "error" })
      return;
    }

    setFirebaseData({
      user: {
        uid: 'john-alex',
        displayName: result.nickname,
        email,
        token: 'access-token',
        role: 'user',
        photoURL: '/assets/images/avatar/A11.jpg'
      },
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const createUserWithEmailAndPassword = async ({
    name,
    email,
    password,
  }: SignUpProps) => {
    console.log('createUserWithEmailAndPassword', name, email, password);
    dispatch(fetchStart());
    try {
      const {user} = await auth.createUserWithEmailAndPassword(email, password);
      await auth!.currentUser!.sendEmailVerification({
        url: window.location.href,
        handleCodeInApp: true,
      });
      await auth!.currentUser!.updateProfile({
        displayName: name,
      });
      setFirebaseData({
        user: {...user, displayName: name} as AuthUser,
        isAuthenticated: true,
        isLoading: false,
      });
      dispatch(fetchSuccess());
    } catch ({message}) {
      setFirebaseData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });
      dispatch(fetchError(message as string));
    }
  };

  const logout = async () => {
    console.log("logout");

    setFirebaseData({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    // setFirebaseData({...firebaseData, isLoading: true});
    // try {
    //   await auth.signOut();
    //   setFirebaseData({
    //     user: null,
    //     isLoading: false,
    //     isAuthenticated: false,
    //   });
    // } catch (error) {
    //   setFirebaseData({
    //     user: null,
    //     isLoading: false,
    //     isAuthenticated: false,
    //   });
    // }
  };

  return (
    <FirebaseContext.Provider
      value={{
        ...firebaseData,
      }}
    >
      <FirebaseActionsContext.Provider
        value={{
          signInWithEmailAndPassword,
          createUserWithEmailAndPassword,
          signInWithPopup,
          logout,
        }}
      >
        {children}
      </FirebaseActionsContext.Provider>
    </FirebaseContext.Provider>
  );
};
export default FirebaseAuthProvider;
