import React, { Component } from "react"
import Highlight from 'react-highlight'
import moment from "moment"
import { 
  Divider, 
  Paper, 
  Typography,
  Snackbar
} from "@material-ui/core";
import axios from "axios"
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MuiAlert from '@material-ui/lab/Alert'

import "bootstrap/dist/css/bootstrap.min.css";
import "./Question.css"

class Question extends Component{
  state = {
    open: false,
    questionContent: null,
    fetchQMessage: false,
    fetchQuestionSuccess: false,
    fetchQuestionWarning: false,
    responseTime: -0.1
  }

  componentDidMount (){
    this.resetStatus()
  }

  componentWillUnmount (){
    this.resetStatus()
  }

  render(){
    return(
      <div 
        key = {this.props.index} 
        className = "individualQuestion"
      >
        <Accordion
          key = {this.props.index} 
          expanded = {this.state.open}
          onChange = {this.handleClick}
        >
          <AccordionSummary
            style = {{
              height: 80,
              width: "100%",
              fontSize: 22,
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row"
            }}
            onChange = {()=>{
              this.setState({
                open: false
              })
            }}
            expandIcon={<ExpandMoreIcon />}
          >
            <div className = "vote">
              <div className = "numberArea">
                {this.props.item.score}
              </div>
              <Typography
                key = {"votesText".concat(this.props.index)} 
                style = {{
                  textAlign: "center"
                }}
              >
                Vote(s)
              </Typography>
            </div>
            <div className = "rightPart">
              <div 
                style = {{
                  overflow: "hidden"
                }}
                className = "titleArea">
                <Highlight innerHTML = {true}>
                  {this.props.item.title}
                </Highlight>
              </div>
              <div className = "creationDate">
                <Typography
                  key = {"timeTypo".concat(this.props.index)} 
                >
                  Created at: {this.converFromUnixTime(this.props.item.creation_date)}
                </Typography>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {this.state.questionContent 
            ? 
              this.displayFullQuestion()
            : ""
            }
          </AccordionDetails>
        </Accordion>
      </div>
    )
  }

  resetStatus = () =>{
    this.setState({
      open: false,
      fetchQMessage: false,
      fetchQuestionSuccess: false,
      fetchQuestionWarning: false,
      responseTime: -0.1
    })
  }

  converFromUnixTime = (unitEpoch) =>{
    return(
      moment.unix(unitEpoch).format('dddd, MMMM Do, YYYY h:mm:ss A')
    )
  }

  displayFullQuestion = () =>{
    return(
      <div
        className = "fullQuestionArea"
      >
        <Paper elevation = {1}>
          <div className = "questionArea">
            <div className = "questionArea-voteArea">
              {this.state.questionContent.score}
            </div>
            <div className = "questionArea-textArea">
              <Highlight innerHTML = {true}>
                {this.state.questionContent.body}
              </Highlight>
              <div className = "questionArea-Time">
                {this.converFromUnixTime(this.state.questionContent.creation_date)}
              </div>
            </div>
          </div>
          {/* Show the comments belong to a question if there's any */}
          {this.state.questionContent.comment_count === 0
            ? null
            : this.state.questionContent.comments.map((comment, index)=>{
              return(
                <div
                  key = {index}
                  className = "commentArea"
                >
                  <div className = "commentArea-voteArea">
                    {comment.score}
                  </div>
                  <div className = "commentArea-textArea">
                    <Divider />
                    <Highlight key = {index} innerHTML = {true}>
                      {comment.body}
                    </Highlight>
                    <div className = "commentArea-Time">
                      {this.converFromUnixTime(comment.creation_date)}
                    </div>
                  </div>
                </div>
              )
            })
          }
        </Paper>
        {/* this shows answers that belong to a question */}
        {this.displayAnswers()}
        {this.handleDisplayFullQ()}
      </div>
    )
  }

  displayAnswers = () =>{
    let result = [];
    if (this.state.questionContent.answer_count === 0){
      return null
    }
    else{
      result.push(
        <Typography
          key = {"answersTypo".concat(this.props.index)} 
          style = {{
            fontSize: 22,
            fontWeight: 500,
            paddingTop: 20
          }}
        >
          {this.state.questionContent.answer_count === 1
            ? 
              <React.Fragment>
                {this.state.questionContent.answer_count} Answer
              </React.Fragment>
            : 
              <React.Fragment>
                {this.state.questionContent.answer_count} Answers
              </React.Fragment>
          }
        </Typography>
      )
      const answers =  this.state.questionContent.answers
      for (let i = 0; i < answers.length; i++){
        result.push(
          <div key = {"answer".concat(i)} className = "fillAnswerArea">
            <div className = "answerArea">
              <div className = "answerArea-voteArea">
                {answers[i].score}
              </div>
              <div className = "answerArea-textArea">
                <Highlight key = {"answer".concat(i)}innerHTML = {true}>
                  {answers[i].body}
                </Highlight>
                <div className = "answerArea-Time">
                  {this.converFromUnixTime(answers[i].creation_date)}
                </div>
              </div>
            </div>
          {this.displayCommentsOfAnswer(i)}
          <Divider/>
          </div>
        )
      }
    }
    return result;
  }

  displayCommentsOfAnswer = (index) =>{
    let result = [];
    const individualAnswer = this.state.questionContent.answers[index]
    if (individualAnswer.comment_count === 0){
      return null
    }
    else{
      const comments = individualAnswer.comments
      for (let i = 0; i < comments.length; i++){
        result.push(
          <div key = {"comment".concat(i, "of answer", index)} className = "commentofAnswers">
            <div className = "commentofAnswers-voteArea">
              {comments[i].score}
            </div>
            <div className = "commentofAnswers-textArea">
              <Divider/>
              <Highlight innerHTML = {true}>
                {comments[i].body}
              </Highlight>
              <div className = "commentofAnswers-Time">
                {this.converFromUnixTime(comments[i].creation_date)}
              </div>
            </div>
          </div>
        )
      }
    }
    return result;
  }

  handleClick = () =>{
    if (!this.state.open){
      this.resetStatus()
      this.fetchFullQuestion()
    }
    this.setState({
      open: !this.state.open
    })
  }

  fetchFullQuestion = () =>{
    let time1 = performance.now()
    let url = "https://api.stackexchange.com/2.2/questions/"
    let questionUrl = url.concat(String(this.props.item.question_id))
    questionUrl = questionUrl.concat("?site=stackoverflow&filter=!IKWum-iRYz9H2TDeF4twRFD6S(8QXKFfsxX0rw(WRWJlF8T")

    // this will fetch all related content of a question and store it state variable
    axios.get(questionUrl)
    .then((response) =>{
      if(response.status === 200 && response.data.items){
        let time2 = performance.now()
        this.setState({
          fetchQMessage: true,
          fetchQuestionSuccess: true,
          fetchQuestionWarning: false,
          questionContent: response.data.items[0],
          responseTime: parseFloat((Math.floor(time2 - time1) + 1)/1000)
        })
      }
    })
    .catch((error)=>{
      if (error.response.data.error_id === 502){
        this.setState({
          fetchQuestionSuccess: false,
          fetchQuestionWarning: false
        })
      }
      else{
        this.setState({
          fetchQuestionSuccess: false,
          fetchQuestionWarning: true
        })
      }
      this.setState({
        fetchQMessage: true
      })
    })
  }

  handleDisplayFullQ = () =>{
    let alertMessage ;
    if (this.state.fetchQuestionSuccess){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="success">
          response time {this.state.responseTime} seconds
        </MuiAlert>
      )
    }
    else if (!this.state.fetchQuestionSuccess && this.state.fetchQuestionWarning){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="error">
          Please check your tag input
        </MuiAlert>
      )
    }
    else if (!this.state.fetchQuestionSuccess && !this.state.fetchQuestionWarning){
      alertMessage = (
        <MuiAlert elevation={6} variant="filled" onClose={this.handleCloseFetchNotice} severity="warning">
          You've exceeded your maximum time for today
        </MuiAlert>
      )
    }
    return (
      <Snackbar
        open={this.state.fetchQMessage} 
        autoHideDuration={3000} 
        onClose={this.handleCloseFetchNotice}
      >
        {alertMessage}
      </Snackbar>
    )
  }

  handleCloseFetchNotice = (event) => {
    this.setState({
      fetchQMessage: false
    })
  }

}

export default Question;