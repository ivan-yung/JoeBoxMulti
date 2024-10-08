import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentQuestion, setGameState, setQuestionMap } from '../../Redux/gameSlice';
import AnswerInitialQuestion from './gamePages/AnswerInitialQuestion';
import OthersAnswering from './gamePages/OthersAnswering';
import Voting from './gamePages/VotingOG';
import Leaderboard from './gamePages/Leaderboard';

const FibbageHandler = ({ socket }) => {
    const dispatch = useDispatch();
    const { gameState, currentQuestion, sittingOutPlayer, questionMap } = useSelector(state => state.game);
    const { userName, roomId } = useSelector(state => state.room);
    const [gameEnded, setGameEnded] = useState(false);
    const [clicks, setClicks] = useState(0);
   
    useEffect(() => {


        const handleGameStateChange = ({ state, sittingOutPlayer }) => {
            console.log('Received game state change:', state, sittingOutPlayer);
            dispatch(setGameState({ state, sittingOutPlayer }));
            if (state === 'gameEnd') {
                setGameEnded(true);
            }
        };

        const handleAssignQuestion = ({ username, question }) => {
            console.log('Received assigned question:', username, question);
            if (username === userName) {
                console.log('Matching username, dispatching action');
                dispatch(setCurrentQuestion({ question }));
            }
        };

       
        socket.on('assignedQuestion', handleAssignQuestion);
        socket.on('gameStateChange', handleGameStateChange);

        return () => {

            socket.off('gameStateChange', handleGameStateChange);
            socket.off('assignedQuestion', handleAssignQuestion);

        };
    }, [socket, dispatch, userName]);


    useEffect(() => {
        const handleGameStateChange = () => {
          socket.emit('nextGameState', { roomCode: roomId });
          console.log('emit state change!');
        };
    

        socket.on('updateGameState', handleGameStateChange);
        socket.on('currentClicks', (answersSubmitted) => {
            setClicks(answersSubmitted);
        });

        return () => {
          socket.off('updateGameState');
          socket.off('currentClicks');
        };
      }, [roomId, socket]);


    // const renderGameComponent = () => {
    //     //question that is going to be displayed in (others answering)
    //     const questionToDisplay = questionMap[sittingOutPlayer] || currentQuestion;

    //     switch (gameState) {
    //         case 'answerInitialQuestion':
    //             return <AnswerInitialQuestion question={currentQuestion} userName={userName} roomID={roomId} socket={socket} />;
    //         case 'othersAnswering':
    //             // Use question from the questionMap if sittingOutPlayer is defined
    //             return sittingOutPlayer && questionMap[sittingOutPlayer] ? (
    //                 <OthersAnswering question={questionToDisplay} roomID={roomId} socket={socket}/>
    //             ) : (
    //               <OthersAnswering question="Default question or error message" />
    //             );
    //         case 'voting':
    //             return <Voting question={questionToDisplay}/>;
    //        case 'leaderboard':
    //          return <Leaderboard question={questionToDisplay} />;
    //        default:
    //         return <div>Unknown game state</div>;
    //     }

    //     console.log(gameState);
    //   };

    const renderGameComponentTest = () => {
        //question that is going to be displayed in (others answering)
        const questionToDisplay = questionMap[sittingOutPlayer] || currentQuestion;

        switch (gameState) {
            case 'answerInitialQuestion':
                return <p> Initial Question</p>;
            case 'othersAnswering':
                // Use question from the questionMap if sittingOutPlayer is defined
                return <p>Others Answering</p>
            case 'voting':
                return <p> Voting </p>;
           case 'leaderboard':
             return <p> Leaderbaord </p>;
           default:
            return <div>Unknown game state</div>;
        }

        console.log(gameState);
      };


    const handleNextState = () => {
        if (!gameEnded) {
            socket.emit('nextGameState', { roomCode: roomId });
        }
    };

    const testSubmit = () => {
        socket.emit('submitAnswer', roomId);
    };

    return (
        <>
            <h1>Fibbage!</h1>
            {renderGameComponentTest()}
            <h2>Current Game State: {gameState}</h2>
            {!gameEnded && <button onClick={ handleNextState }>Next State</button>}
            {gameEnded && <p>Game has ended!</p>}

            {sittingOutPlayer && <p>Sitting Out Player: {sittingOutPlayer}</p>}
            {/* {!gameEnded && <button onClick={handleNextState}>Next State (Test)</button>} */}
            {gameEnded && <p>Game has ended!</p>}

            <button onClick = {testSubmit}>TestSubmit {clicks}</button>
            <h1>{clicks}</h1>
        </>
    );
};

export default FibbageHandler;
