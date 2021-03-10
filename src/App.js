import React, { Component } from "react"
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography,
  TextField,
  Divider,
  Tooltip,
  Snackbar
} from "@material-ui/core"
import axios from "axios"
import Question from "./Question"
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import MuiAlert from '@material-ui/lab/Alert'

import './App.css'

class App extends Component{
  state = {
    tag: "",
    textFieldError: false,
    allQuestions: [],
    fetchMessage: false,
    fetchSuccess: false,
    fetchWarning: false,
    responseTime: -0.1
  }

  componentDidMount (){
    this.clearTextField();
  }

  componentWillUnmount(){
    this.resetStatus()
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
              error = {this.state.textFieldError}
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
        {this.displaySearchMessage()}
        <div className = "QuestionContent">
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
                  <Divider style = {{width: "calc(100% - 60px)"}}/>
                </React.Fragment>
              )
            })
          }
          <div className = "rightPanel">
            <Tooltip title = "back to top">
              <ExpandLessIcon
                fontSize = "large"
                className = "scrollTopIcon"
                onClick = {()=>{
                  window.scrollTo({top: 0, behavior: "smooth"})
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  displaySearchMessage = () =>{
    let alertMessage ;
    if (this.state.fetchSuccess){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="success">
          response time {this.state.responseTime} seconds
        </MuiAlert>
      )
    }
    else if (!this.state.fetchSuccess && this.state.fetchWarning){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="error">
          Please check your tag value, 0 results for current tag
        </MuiAlert>
      )
    }
    else if (!this.state.fetchSuccess && !this.state.fetchWarning){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="warning">
          You've exceeded your maximum time for today
        </MuiAlert>
      )
    }
    return (
      <Snackbar
        open={this.state.fetchMessage} 
        autoHideDuration={3000} 
        onClose={this.handleCloseFetchNotice}
      >
        {alertMessage}
      </Snackbar>
    )
  }

  handleCloseFetchNotice = (event) => {
    this.setState({
      fetchMessage: false
    })
  }

  fetchAllQuestions = () => {
    if (this.state.tag.trim() === ""){
      this.setState({
        textFieldError: true,
        fetchMessage: true,
        fetchSuccess: false,
        fetchWarning: true
      })
      return
    }
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
    let time1 = performance.now()
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
        let time2 = performance.now()
        sortedQuestions = this.sortArray(questions, 0, questions.length - 1)
        if (responses[0].data.items.length + responses[1].data.items.length === 0){
          this.setState({
            fetchMessage: true,
            fetchSuccess: false,
            fetchWarning: true
          })
          return
        }
        this.setState({
          allQuestions: sortedQuestions,
          responseTime: parseFloat((Math.floor(time2 - time1) + 1) / 1000),
          fetchSuccess: true,
          fetchWarning: false
        })
      }
      else{
        this.setState({
          fetchSuccess: false,
          fetchWarning: false
        })
      }
      this.setState({
        fetchMessage: true
      })
    }))
    .catch(error=>{
      this.setState({
        fetchMessage: true,
        fetchSuccess: false,
        fetchWarning: true
      })
    })
    return sortedQuestions
  }

  resetStatus = () =>{
    this.setState({
      textFieldError: false,
      fetchMessage: false,
      fetchSuccess: false,
      fetchWarning: false,
      responseTime: -0.1
    })
  }

  handleSearch = () =>{
    this.resetStatus()
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
