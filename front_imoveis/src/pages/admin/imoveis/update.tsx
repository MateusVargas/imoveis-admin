import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { useParams, useHistory } from 'react-router-dom'

import Layout from '../../../components/admin/layout/layout'
import {useSelector,useDispatch} from 'react-redux'
import {AplicationState} from '../../../store'

import {imovelGetSingle, imovelUpdate} from '../../../actions/ImovelActions'
import {corretorGet} from '../../../actions/CorretorActions'

import {apiGet} from '../../../services/api'

interface Categoria{
    id: number
    descricao: string
}

const UpdateImovel = () => {

    const history = useHistory()
    const {id}:any = useParams()

    const {imovel} = useSelector((state: AplicationState)=>state.imoveis)
    const {corretores} = useSelector((state: AplicationState)=>state.corretores)
    const dispatch = useDispatch()

    const [imovelPosition, setImovelPosition] = useState<[number,number]>([0,0])
    
    const [selectedCorretor, setSelectedCorretor] = useState('0')

    const [categoria, setCategoria] = useState<Categoria[]>([])
    const [selectedCategoria, setSelectedCategoria] = useState('0')
    
    const [file,setFile] = useState<FileList>()

    const [formData, setFormData] = useState({
        descricao: imovel.descricao,
        valor: '',
        endereco: '',
        detalhes: '',
    })

    useEffect(()=>{
        const getImovel = async () =>{
            const resp = await dispatch(imovelGetSingle(id))
            setImovelPosition([resp.payload.data[0].latitude,resp.payload.data[0].longitude])
            
            setSelectedCategoria(resp.payload.data[0].id_categoria === null ? '0' : resp.payload.data[0].id_categoria)
            

            setSelectedCorretor(resp.payload.data[0].id_corretor === null ? '0' : resp.payload.data[0].id_corretor)


            setFormData({
                descricao: resp.payload.data[0].descricao,
                detalhes: resp.payload.data[0].detalhes,
                valor: resp.payload.data[0].valor,
                endereco: resp.payload.data[0].endereco
            })
            console.log(resp)
        }
        getImovel()
        dispatch(corretorGet())
    },[id,imovelGetSingle])

    useEffect(() => {
        apiGet('/categorias').then(resposta => {
            setCategoria(resposta.data)
        })
    }, [])


    const voltar = () => {
        history.push('/imoveis')
    }

    function mapClick(event: LeafletMouseEvent){
        setImovelPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function corretorSelecionado(event: ChangeEvent<HTMLSelectElement>){
        const corretor = event.target.value
        setSelectedCorretor(corretor)
    }

    function categoriaSelecionado(event: ChangeEvent<HTMLSelectElement>){
        const categoria = event.target.value
        setSelectedCategoria(categoria)
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value })
    }

    function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>){
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value })
    }

    function handleInputFileChange(event: FileList){
        setFile(event)
    }

    async function updateImovel(event: FormEvent){
        event.preventDefault()
        try{
            const { descricao, valor, endereco, detalhes } = formData
            const [latitude, longitude] = imovelPosition
            const uf = "RS"
            const cidade = "Santa Maria"
            const categoria = selectedCategoria
            const corretor = selectedCorretor
            
            const dados = new FormData()
            dados.append('descricao', descricao)
            dados.append('endereco', endereco)
            dados.append('detalhes', detalhes)
            dados.append('latitude', String(latitude))
            dados.append('longitude', String(longitude))
            dados.append('cidade', cidade)
            dados.append('uf', uf)
            dados.append('valor', String(valor))
            dados.append('id_categoria', categoria)
            dados.append('id_corretor', corretor)

            if(file){
                for (let i = 0; i < file.length; i++) {
                    dados.append('imageImovel', file[i])
                }  
            }
        
            const resp = await dispatch(imovelUpdate(id, dados))
            if(resp.payload.status === 204){
                voltar()
            }
            else{
                alert('Não foi posível atualizar')
            }
        }catch(error){
            console.log(error)
            alert('Não foi posível atualizar')
        }

    }


    return (
        <Layout title="Editar imóvel" back="/imoveis">
            <form onSubmit={updateImovel} style={{marginBottom:'6rem'}}>
                <div className="input-field">
                    <label htmlFor="descricao">Descricao</label>
                    <input type="text" id="descricao" name="descricao" className="form-control" value={formData.descricao} onChange={handleInputChange}/>
                </div>
                <div className="input-field">
                    <label htmlFor="valor">Valor R$</label>
                    <input type="number" step="0.01" id="valor" name="valor" className="form-control" value={formData.valor} onChange={handleInputChange}/>
                </div>

                <div className="form-row">
                    <div className="form-group col-12">
                        <label htmlFor="imageImovel">Adicione fotos ao imóvel:</label>
                        <input type="file" multiple className="file ml-3" id="imageImovel" name="imageImovel" onChange={(e)=>handleInputFileChange(e.target.files as FileList)}/>
                    </div>
                </div>

                <Map center={imovelPosition} zoom={13} onclick={mapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={imovelPosition}/>
                </Map>

                <div className="input-field">
                    <label htmlFor="endereco">Endereço</label>
                    <input type="text" id="endereco" name="endereco" className="form-control" value={formData.endereco} onChange={handleInputChange}/>
                </div>

                <div className="input-field">
                    <label htmlFor="select_estado">Estado</label>
                    <select id="select_estado" className="form-control" value="RS">
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                    </select>
                </div>
                <div className="input-field">
                        <label htmlFor="select_cidade">Cidade</label>
                        <select id="select_cidade" className="form-control" value="Santa Maria">
                            <option value="0" selected>Santa Maria</option>
                    </select>
                </div>

                <div className="input-field">
                    <label htmlFor="select_corretor">Corretor responsável</label>
                    <select id="select_corretor" name="select_corretor" className="form-control" value={selectedCorretor} onChange={corretorSelecionado}>
                        <option value="0">Nenhum</option>
                        {corretores.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="input-field">
                    <label htmlFor="select_categoria">Categoria</label>
                    <select id="select_categoria" name="select_categoria" className="form-control" value={selectedCategoria} onChange={categoriaSelecionado}>
                        <option value="0">Nenhum</option>
                        {categoria.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.descricao}</option>
                        ))}
                    </select>
                </div>

                <div className="input-field">
                    <label htmlFor="detalhes">Detalhes</label>
                    <textarea rows={5} id="detalhes" name="detalhes" className="form-control" value={formData.detalhes} onChange={handleTextAreaChange}></textarea>
                </div>
                <div className="form-row col-md-12 justify-content-center">
                    <button type="submit" className="btn btn-primary">Atualizar</button>
                </div>
            </form>
        </Layout>
    )
}

export default UpdateImovel