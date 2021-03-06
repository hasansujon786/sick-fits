import React, {useState} from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag'
// file imports
import From from './styles/Form'
import ErrorMessage from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION ($data: ItemCreateInput!) {
    createItem(data: $data) {
      id
    }
  }
`
const ItemCreate = () => {
  const [state, setState] = useState({
    title: 'random title',
    description: 'random description',
    price: 10000,
    image: '',
    largeImage: '',
  })

  const handleChange = (e) => {
    const {name, type, value} = e.target
    const val = type === 'number' ? parseFloat(value) : value
    setState({...state, [name]: val})
  }

  const handleSubmit = async (e, createItem) => {
    e.preventDefault()
    const {data} = await createItem()
    // TODO
    // Show user a push notification to with a link to view
    // currently created item.

    // Router.push({
    //   pathname: '/item',
    //   query: {id: data.createItem.id}
    // })
  }

  const uploadImage = async e => {
    const clApi = 'https://api.cloudinary.com/v1_1/hasansujon786/upload'
    const files = e.target.files

    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sick-fits')

    const res = await fetch(clApi, {
      method: 'post',
      body: data
    })

    // TODO - check if image upload is successful
    const file = await res.json()
    console.log(file)
    setState({
      ...state,
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  return (
    <div>
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={{data: state}}>
        {(createItem, {loading, error}) => (
          <From onSubmit={(e) => handleSubmit(e, createItem)}>
            <ErrorMessage error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">
                Title
                <input
                  required
                  onChange={handleChange}
                  type="text"
                  name="title"
                  placeholder="title"
                  id="title"
                  value={state.title}
                />
              </label>

              <label htmlFor="image">
                Image
                <input
                  onChange={uploadImage}
                  type='file'
                  name="image"
                  placeholder="Upload an image"
                  id="image"
                />

                {state.image && <img src={state.image} alt="Upload Preview" />}
              </label>
              <label htmlFor="price">
                Price
                <input
                  required
                  onChange={handleChange}
                  type='number'
                  name="price"
                  placeholder="price"
                  id="price"
                  value={state.price}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  required
                  onChange={handleChange}
                  name="description"
                  placeholder="Enter A Description"
                  id="description"
                  value={state.description}
                />
              </label>
              <button type='submit'>Submit</button>
            </fieldset>
          </From>)}
      </Mutation>
    </div>
  );
}

export default ItemCreate
