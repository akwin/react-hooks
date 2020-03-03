import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

//the ingredientReducer stores a function which takes in the state and action
//action is important for updating the state
//the reducer function is decoupled from what is happening inside the component function

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD' :
      return [...currentIngredients, action.ingredient]; //old array of ingredients + the new item
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default: 
      throw new Error('Should not reach there!');
  }
};

const httpReducer = ( currHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE' :
      return { ...currHttpState, loading: false };
    case 'ERROR' :
      return { loading: false, error: action.error };
    case 'CLEAR' :
      return { ...currHttpState, error: null }
    default:
      throw new Error('Should not reach there!');
  }
};

function Ingredients() {  //both function and const syntax of making functional components are valid
  const [userIngredrients, dispatch] = useReducer(ingredientReducer, []); //empty array because initially state is empty 
  const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    console.log('Ingredients are rendering', userIngredrients);
  }, [userIngredrients]);

  //useEffect allows us to manage side-effects such as HTTP requests 
  //the function passed to useEffect gets executed after every component render cycle i.e., it works like componentDidUpdate: it runs after every component re-render
  //useEffect takes in a second argument - an array with the dependencies of your function that determine when the function will re-run
  //used like this i.e., with [] as a second argument, useEffect acts like componentDidMount: it runs only once, after the first render.

  const filterIngredientsHandler = useCallback(filteredIngredients => {
    //setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-8a631.firebaseio.com/ingredients.json' , {
      method: 'POST', // by default fetch sends a GET request but firebase wants a POST request to store data
      body: JSON.stringify(ingredient), //takes a JS object or array and converts it to valid JSON; axios does data conversion automatically
      headers: { 'Content-Type' : 'application/json' } //inform firebase we have some incoming json data
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      return response.json();
    }).then(responseData => {
     // setUserIngredients(prevIngredients => [
       // ...prevIngredients,
       // 
       dispatch({type: 'ADD', ingredient: { id: responseData.name, ...ingredient } })
  
    });
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    dispatchHttp({type: 'SEND'});
    fetch(`https://react-hooks-8a631.firebaseio.com/ingredients/${ingredientId}.json` , {
      method: 'DELETE'
    }).then(response => {
        dispatchHttp({type: 'RESPONSE'});
        //setUserIngredients(prevIngredients => 
        //prevIngredients.filter((ingredient) => ingredient.id !== ingredientId));
        dispatch({type: 'DELETE', id: ingredientId });
    }).catch(error => {
      //setError('Oops, something went wrong!');
      dispatchHttp({type: 'ERROR', error: 'Something went wrong!'});
    });
  }, []);

  const clearError = () => {
    dispatchHttp({type: 'CLEAR'});
  }

  const ingredientList = useMemo(() => {
    return (
      <IngredientList 
        ingredients={userIngredrients} 
        onRemoveItem={removeIngredientHandler}/>
    );
  }, [userIngredrients, removeIngredientHandler]);

  return (
    <div className="App">
    {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
