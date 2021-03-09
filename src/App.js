import React, { Component } from "react"
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography,
  TextField,
  Divider
} from "@material-ui/core"
import axios from "axios"
import Question from "./Question";

import './App.css'

class App extends Component{
  state = {
    tag: "",
    allQuestions: []
  }

  componentDidMount (){
    this.clearTextField();
  }
  
  render(){
    return (
      <div className="App">
        <AppBar
          id="headerComponent"
          position="sticky"
          color = "primary"
          style = {{
            minWidth: 800
          }}
        >
          <Toolbar
            style = {{
              alignItems: "center"
            }}
          >
            <Typography
              style = {{
                color: "black",
                fontWeight: 600, 
                fontSize: 18
              }}
            >
              Search for questions on Stack Overflow
            </Typography>
            <Typography
              style={{
                flex: 1
              }}
            />
            <TextField
              variant="outlined"
              margin="dense"
              id="headerSearchField"
              className="headerSearchField"
              type="email"
              value={this.state.tag}
              style = {{
                backgroundColor: "white",
                color: "black",
                border: "none",
                borderRadius: 3,
                width: 300,
                marginTop: 4,
                marginBottom: 4, 
                marginRight: 20
              }}
              placeholder = "Enter the tag to search here"
              onChange={this.handleTagChange}
            />
            <Button
              variant = "contained"
              className = "searchButton"
              style = {{
                color: "#0F1111",
                backgroundColor: "#f0c14b",
                fontWeight: 600,
              }}
              onClick = {this.handleSearch}
            >
              Submit
            </Button>
          </Toolbar>
        </AppBar>
        {this.state.allQuestions.length === 0 
          ? 
            null 
          : 
          this.state.allQuestions.map((item, index)=>{
            return (
              <React.Fragment key = {index}>
              <Question
                key = {index}
                item = {item}
              />
              <Divider/>
              </React.Fragment>
            )
          })
        }
      </div>
    )
  }

  fetchAllQuestions = () => {
    const currTime = Math.round(Date.now()/1000) // current epoch time
    const weekAgo = currTime - (7 * 24 * 60 * 60) // epoch time for a week ago

    const urlBase = "https://api.stackexchange.com/2.2/search?page=1&pagesize=10&site=stackoverflow&order=desc"
    // The following url should retrive the ten most created question
    let url1 = urlBase.concat(
      "&sort=creation",
      "&fromdate=",
      weekAgo, 
      "&todate=",
      currTime,
      "&tagged=",
      this.state.tag
    )

    // The following url should retrive ten most voted questions
    let url2 = urlBase.concat(
      "&sort=votes",
      "&fromdate=",
      weekAgo, 
      "&todate=",
      currTime,
      "&tagged=",
      this.state.tag
    )
    
    let questions = [];
    let sortedQuestions;
    axios.all([
      axios.get(url1),
      axios.get(url2)
    ])
    .then(axios.spread((...responses) => {
      if (responses[0].status === 200 && responses[1].status === 200){
        // responses[0].data.items.length should be 10
        if (responses[0].data.items){
          const mostRecentQuestions = responses[0].data.items
          mostRecentQuestions.forEach(item =>{
            questions.push(item)
          })
        }
        // responses[1].data.items.length should be 10
        if (responses[1].data.items){
          const mostVotedQuestions = responses[1].data.items
          mostVotedQuestions.forEach(item =>{
            questions.push(item)
          })
        }
        sortedQuestions = this.sortArray(questions, 0, questions.length - 1)
        this.setState({
          allQuestions: sortedQuestions
        })
      }
    }))
    return sortedQuestions
  }

  handleSearch = () =>{
    this.fetchAllQuestions()
  }

  sortArray = (items, left, right) =>{
    let index;

    if (items.length > 1){
      index = this.partition(items, left, right)

      if (left < index -1){
        this.sortArray(items, left, index - 1)
      }
      if (index < right){
        this.sortArray(items, index, right)
      }
    }
    return items
  }

  partition = (items, left, right) =>{
    let pivot = items[Math.floor((left + right) / 2)].creation_date
    let i = left
    let j = right

    while (i < j){
      while (items[i].creation_date > pivot){
        i++
      }
      while (items[j].creation_date < pivot){
        j--
      }
      if (i <= j){
        this.swap(items, i, j)
        i++
        j--
      }
    }

    return i
  }

  swap = (items, left, right)=>{
    let temp = items[left]
    items[left] = items[right]
    items[right] = temp
  }


  clearTextField = () =>{
    this.setState({
      tag: ""
    })
  }

  handleTagChange = (event) =>{
    this.setState({
      tag: event.target.value
    })
  }
}

export default App;
