import React, { useEffect } from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom'
import { Button } from 'antd'

function LandingPage(props){
    
    useEffect(() => {
        axios.get('/api/hello')
        .then(response => console.log(response.data))
    }, [])

    const onLogoutHandler = () => {
        axios.get('/api/users/logout')
            .then(response => {
                if(response.data.success){
                    props.history.push('/login')
                } else {
                    //alert("Failed to log out.")
                    props.history.push('/login')
                }
            })
    }

    return (
        <>
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh'
        }}>
            <h2>Welcome to Jason's Website!</h2>
            <Button style={{
                position: 'absolute',
                bottom: "40%",
                left: "46%",
            }} onClick={onLogoutHandler}>Log Out</Button>
            {/*<button onClick={onLogoutHandler}>Log Out</button>*/}
        </div>
        </>
    )
}

export default withRouter(LandingPage)