import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
  const { onLoadIngredients } = props; //object destructuring 
  const [enteredFilter, setEnteredFilter] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
      const query = 
      enteredFilter.length === 0 
        ? '' 
        : `?orderBy="title"&equalTo="${enteredFilter}"`;
      fetch('https://react-hooks-8a631.firebaseio.com/ingredients.json' + query)
        .then(response => response.json())
        .then(responseData => {
          const loadedIngredients = [];
            for (const key in responseData) {
            loadedIngredients.push({
              id: key,
              title: responseData[key].title,
              amount: responseData[key].amount
        });
      }
      onLoadIngredients(loadedIngredients);
    });
      }
    }, 500); //this is executed during the first render and return is not executed but on the next keystroke we clean up the old timer and run a new one
    return () => {    //cleanup function, runs before the function in useEffect runs the next time (not after it has run the first time but before it runs the next time)
      clearTimeout(timer); //ensures we only have one ongoing timer cuz it cleans up the old effect before the next one 
    };
  }, [enteredFilter, onLoadIngredients, inputRef]);

  //if you have [] as dependencies of your function in useEffect, the cleanup function runs when the component gets unmounted 

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input 
                  ref={inputRef}
                  type="text"
                  value={enteredFilter}
                  onChange={event => setEnteredFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
