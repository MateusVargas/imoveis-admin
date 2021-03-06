import React, {useState,useEffect,FormEvent,ChangeEvent} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import Layout from '../../../components/admin/layout/layout'
import {useDispatch,useSelector} from 'react-redux'
import {AplicationState} from '../../../store'

import {userGetSingle, userUpdate} from '../../../actions/UserActions'

const UserUpdate = () => {
    const history = useHistory()
    const {id}:any = useParams()

    const dispatch = useDispatch()

    const [formData,setFormData] = useState({
        login: '',
        password: '',
        password_confirmation: ''
    })

    useEffect(() => {
        const getUser = async () =>{
            const resp = await dispatch(userGetSingle(id))
            setFormData({login: resp.payload.data[0].usuario, password: '', password_confirmation: ''})
        }
        getUser()
    }, [id, userGetSingle])
    
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value })
    }

    async function UpdateUsuario(event: FormEvent){
        event.preventDefault()
        const data = formData
        console.log(data)
        try {
            const resp = await dispatch(userUpdate(id, data))
            if(resp.payload.status === 204){
                voltar()
            }
            else{
                alert('Não foi posível atualizar')
            }
        } catch (error) {
            console.log(error)
            alert('Não foi posível atualizar')
        }
    }

    function voltar(){
        history.push('/usuarios')
    }

    return(
        <Layout title="Editar usuário" back="/usuarios">
            <form onSubmit={UpdateUsuario}>
                <div className="input-field">
                    <label htmlFor="login">Nome</label>
                    <input type="text" className="form-control" id="login" name="login" value={formData.login} onChange={handleInputChange}/>
                </div>
                <div className="input-field">
                    <label htmlFor="password">Nova senha</label>
                    <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleInputChange}/>
                </div>
                <div className="input-field">
                    <label htmlFor="password_confirmation">Confirme a senha</label>
                    <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" onChange={handleInputChange}/>
                </div>
                <div>
                    <button type="submit" className="btn btn-primary">Atualizar</button>
                </div>
            </form>
        </Layout>
    )
}

export default UserUpdate