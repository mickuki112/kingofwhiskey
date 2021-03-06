import React, { Component } from 'react';
import classes from './Auth.css';

// Redux
import * as actions from '../../store/actions/index';
import { connect } from 'react-redux';

// Components
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import { validationSystem } from '../../shared/utility';

class Auth extends Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Mail address'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 5,
                    email: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6,
                    password: true
                },
                valid: false,
                touched: false
            },
        },
        isSingUp: true
    };

    inputChangeHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                valid: validationSystem(
                    this.state.controls[controlName].validation,
                    event.target.value
                ),
                touched: true
            }
        };
        this.setState({ controls: updatedControls });
    };

    submitHandler = (event) => {
        event.preventDefault();
        const updatedControls = { ...this.state.controls };

        if (this.state.controls.password.value === '') updatedControls.password.touched = true;
        else if (this.state.controls.email.value === '') updatedControls.email.touched = true;
        else return this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSingUp);

        this.setState({ controls: updatedControls });
    };

    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return {
                isSingUp: !prevState.isSingUp
            };
        });
    };

    render() {
        let error = null;

        if (this.props.error) {
            switch (this.props.error.message) {
                case ('EMAIL_EXISTS'):
                    error = <p className={classes.Error}>This E-mail already exists!</p>;
                    break;
                case ('TOO_MANY_ATTEMPTS_TRY_LATER'):
                    error = <p className={classes.Error}>Too many attempts. Try again later</p>;
                    break;
                case ('EMAIL_NOT_FOUND'):
                    error = <p className={classes.Error}>This E-mail was not found!</p>;
                    break;
                case ('INVALID_PASSWORD'):
                    error = <p className={classes.Error}>This password is incorrect!</p>;
                    break;
                case ('USER_DISABLED'):
                    error = <p className={classes.Error}>This user has been disabled by Administrator!</p>;
                    break;
                default:
                    error = null;
                    break;
            }
        }

        const formElementsArray = [];
        for (let key in this.state.controls) {
            formElementsArray.push({
                id: key,
                config: this.state.controls[key]
            })
        }

        let login = <Spinner />;
        let form = null;

        if(!this.props.loading) {
            form = formElementsArray.map(inputEl => (
                <Input
                    key={inputEl.id}
                    valueName={inputEl.id}
                    elementType={inputEl.config.elementType}
                    elementConfig={inputEl.config.elementConfig}
                    value={inputEl.config.value}
                    invalid={!inputEl.config.valid}
                    touched={inputEl.config.touched}
                    shouldValidate={inputEl.config.validation}
                    changed={(event) => this.inputChangeHandler(event, inputEl.id)} />
            ));
        }

        if(!this.props.loading) {
            login = (
                <React.Fragment>
                    {error}
                    <form onSubmit={this.submitHandler}>
                        {form}
                        <Button btnType="Success">SUBMIT</Button>
                    </form>
                    <Button
                        clicked={this.switchAuthModeHandler}
                        btnType="Danger">SWITCH TO {this.state.isSingUp ? 'SIGN IN' : 'SIGN UP'}</Button>
                </React.Fragment>
            )
        }

        return (
            <div className={classes.Auth}>
                <div className={classes["flex-form"]}>
                    {login}
                </div>
            </div>
        );
    };
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuth: state.auth.token !== null,
        authRedirectPath: state.auth.authRedirectPath,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignUp) => dispatch(actions.auth(email, password, isSignUp)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
