import LectureEvaluationContract from 'klaytn/LectureEvaluationContract'
import { cav } from 'klaytn/caver'
import { getWallet } from 'utils/crypto'
import ui from 'utils/ui'
import { evaluationParser } from 'utils/misc'
import { 
  SET_EVALUATION,
  UPLOAD_GOOD,
  UPLOAD_BAD,
  GET_EVAL,
 } from './actionTypes'

const setEvaluation = (evalu) => ({
    type: SET_EVALUATION,
    payload: { evalu },
  })
const setEvaluationContent = (evaluD) => ({
  type: GET_EVAL,
  payload: { evaluD },
})



export const getEvaluationList = (courseId) => (dispatch) => {
  LectureEvaluationContract.methods.getEvaluationNum(courseId).call()
      .then((evaluationNum) => {
        if (!evaluationNum) return []
        const evaluations = []
        console.log('여기는 actions', evaluationNum)
        for (let i = 0; i < evaluationNum; i++) {
          const evaluation = LectureEvaluationContract.methods.getEvaluation(courseId, i, true).call()
          evaluations.push(evaluation)
        }
        return Promise.all(evaluations)
      })
      .then((evaluations) => dispatch(setEvaluation(evaluationParser(evaluations))))
}

export const getEvaluation = (courseId, evaluationId) => (dispatch) => {
  LectureEvaluationContract.methods.deposit().send({
    from: getWallet().address,
    gas: '100000',
    value: cav.utils.toPeb("0.1", "KLAY")
  })
  .once('transactionHash', (txHash) => {
    ui.showToast({
      status: 'pending',
      message: `Sending a transaction... (getEvaluation)`,
      txHash,
    })
  })
  .once('receipt', (receipt) => {
    ui.showToast({
      status: receipt.status ? 'success' : 'fail',
      message: `Received receipt! It means your transaction is
      in klaytn block (#${receipt.blockNumber}) (getEvaluation)`,
      link: receipt.transactionHash,
    })
    LectureEvaluationContract.methods.getEvaluationNum(courseId).call()
      .then((evaluationNum) => { console.log(evaluationNum)})
    LectureEvaluationContract.methods.getEvaluation(courseId, evaluationId, true).call()
      .then((evaluation) => dispatch(setEvaluationContent(evaluationParser(evaluation))))
  })
  .once('error', (error) => {
    ui.showToast({
      status: 'error',
      message: error.toString(),
    })
  })  
}

export const uploadGood = (courseId, evaluationId) => (dispatch) => {
  LectureEvaluationContract.methods.addEvalGood(courseId, evaluationId).call()
  // receiveKlay(0.1);
  return dispatch({
    type: UPLOAD_GOOD,
  })
}


export const uploadBad = (courseId, evaluationId) => (dispatch) => {
  LectureEvaluationContract.methods.addEvalBad(courseId, evaluationId).call()
  // receiveKlay(0.1);
  return dispatch({
    type: UPLOAD_BAD,
  })
}

const receiveKlay = (amount) => (dispatch) => {
  console.log("receiveKlay");
  LectureEvaluationContract.methods.transfer(amount).send({
    from: getWallet().address,
    gas: '2000000',
  })
  .once('receipt', (receipt) => {
    alert(amount + " KLAY 가 지급되었습니다.");
  })
  .once('error', (error) => {
    ui.showToast({
      status: 'error',
      message: error.toString(),
    })
  })
}


export const uploadEvaluation = (courseId, title, score, content) => (dispatch) => {

  console.log('uploadEvaluation called')
  console.log(courseId)
  console.log(title)
  console.log(score)
  console.log(content)

  LectureEvaluationContract.methods.uploadEvaluation(courseId, title, score, content).send({
    from: getWallet().address,
    gas: '20000000',
  })
    .once('transactionHash', (txHash)=>{
      ui.showToast({
        status:'pending',
        message: `sending a transaction .. (upload evaluation)`,
        txHash,
      })
    })
    .once('receipt', (receipt) => {
      ui.showToast({
        status: receipt.status ? 'success' : 'fail',
        message: `Received receipt! It means your transaction is in klaytn block (upload evaluation)`,
        link: receipt.transactionHash
      })
    })
    .once('error', (error) => {
      ui.showToast({
        status: 'error',
        message: error.toString(),
      })
    })

    receiveKlay("0.1");


  
}
