import React, {Component} from 'react';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            submitted: false,
            disabledTest: true
        };

        setTimeout(() => {
            this.setState({
                disabledTest: false
            });
        }, 5000);
        console.error("constructor error");
    }

    onSubmit = (event) => {
        event.preventDefault();
        this.setState({
            submitted: true
        });
    };

    render() {
        return (
            <div className="App">
                {this.state.submitted && <p id="SubmittedText">The form was successfully submitted!</p>}
                <form onSubmit={this.onSubmit}>
                    <label>
                        Name:
                        <input id="textInput" type="text" name="name" />
                    </label>
                    <div>
                        <label>
                            Checkbox:
                            <input id="checkboxInput" type="checkbox" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Select:
                            <select>
                                <option data-test-attribute="frst" value="test1">First</option>
                                <option data-test-attribute="sec" value="test2">Second</option>
                                <option data-test-attribute="custom" value="test3">Third</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            File:
                            <input id="fileInput" type="file" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Radio:
                            <input id="firstRadio" type="radio" />
                            <input id="secondRadio" type="radio" />
                        </label>
                    </div>
                    <input id="submitForm" type="submit" value="Submit" />
                </form>
                <button disabled={this.state.submitted}>Test Button</button>
                <button id="visibilityTestButton" hidden={this.state.submitted}>Test Visibility</button>
                <span>TestSpan</span>
                <div id="divText">TestDivText</div>
                <textarea />
                <button id="enabledTestButton" disabled={this.state.disabledTest}>Test Enabled</button>
            </div>
        );
    }
}

export default App;
