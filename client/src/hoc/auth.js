import React, { useEffect } from 'react';
import Axios from 'axios';
import { useDitspatch, useDispatch } from 'react-redux';
import { auth } from "../_actions/user_action"

export default function (SpecificComponent, option, adminRoute = null){
    
    // option:
    // null: WebPages that anyone can access to
    // true: WebPages accessible only to loged in users
    // false: WebPages not accessed by loged in users

    function AuthenticationCheck(props){
        
        const dispatch = useDispatch();
        
        useEffect(() => {
            dispatch(auth()).then(response => {
                // If the user does not log in:
                if(!response.payload.isAuth){
                    if(option) {
                        props.history.push('/login')    // return to the login page.
                    }
                } else {    // If the user does log in:
                    if(adminRoute && !response.payload.isAdmin){
                        props.history.push('/')
                    } else {
                        if(option === false){
                            props.history.push('/')
                        }
                    }
                }
            })
        }, [])

        return <SpecificComponent />
    }

    return AuthenticationCheck
}