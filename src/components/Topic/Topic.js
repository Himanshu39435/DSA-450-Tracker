import React, { useState, useEffect, useContext, useCallback } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Fade from "react-reveal/Fade";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./Topic.css";
import { ThemeContext } from "../../App";
import Button from "react-bootstrap/Button";

export default function Topic({ data, updateData }) {
	const [select, setSelected] = useState([]);
	const [questionsTableData, setQuestionsTableData] = useState([]);
	const [topicName, setTopicName] = useState("");
	const dark = useContext(ThemeContext);

	const shownotes = useCallback((ind) => {
		document.getElementsByClassName("note-section")[0].style.display = "block";
		document.getElementsByClassName("note-exit")[0].style.display = "block";
		document.getElementsByClassName("note-save")[0].style.display = "block";
		document.getElementsByClassName("note-area")[0].style.display = "block";

		localStorage.setItem("cid", ind);
		document.getElementsByClassName("note-section")[0].value = data.questions[ind].Notes;
		document.getElementsByClassName("question-title")[0].innerHTML = data.questions[ind].Problem;
	}, [data]);

	useEffect(() => {
		if (data !== undefined) {
			let doneQuestion = [];

			let tableData = data.questions.map((question, index) => {
				if (question.Done) {
					doneQuestion.push(index);
				}
				return {
					id: index,
					question: (
						<>
							<a
								href={question.URL}
								target="_blank"
								rel="noopener noreferrer"
								style={{ fontWeight: "600" }}
								className="question-link"
							>
								{question.Problem}
							</a>
							<OverlayTrigger
								placement="left"
								overlay={question.Notes && question.Notes.length !== 0 ? renderTooltipView : renderTooltipAdd}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									className={question.Notes && question.Notes.length !== 0 ? "bi bi-sticky-fill" : "bi bi-sticky"}
									viewBox="0 0 16 16"
									style={{ float: "right", color: "green", cursor: "pointer" }}
									onClick={() => shownotes(index)}
								>
									{question.Notes && question.Notes.length !== 0 ? (
										<path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1h-11zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177V9.5z" />
									) : (
										<path d="M2.5 1A1.5 1.5 0 0 0 1 2.5v11A1.5 1.5 0 0 0 2.5 15h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 15 8.586V2.5A1.5 1.5 0 0 0 13.5 1h-11zM2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5V8H9.5A1.5 1.5 0 0 0 8 9.5V14H2.5a.5.5 0 0 1-.5-.5v-11zm7 11.293V9.5a.5.5 0 0 1 .5-.5h4.293L9 13.793z" />
									)}
								</svg>
							</OverlayTrigger>
						</>
					),
					_is_selected: question.Done,
					_search_text: question.Problem,
				};
			});
			setQuestionsTableData(tableData);
			setTopicName(data.topicName);
			setSelected(doneQuestion);
		}
	}, [data, shownotes]);

	const renderTooltipView = (props) => (
		<Tooltip {...props} className="in" id="button-tooltip">
			View Notes
		</Tooltip>
	);

	const renderTooltipAdd = (props) => (
		<Tooltip {...props} className="in" id="button-tooltip">
			Add Notes
		</Tooltip>
	);

	const SearchBar = (props) => {
		const handleChange = (e) => props.onSearch(e.target.value);
		return (
			<div className="container container-custom2">
				<InputGroup className="mb-4">
					<FormControl
						className="text-center"
						placeholder="Search Question.. 🔍"
						aria-label="Search Question"
						onChange={handleChange}
					/>
					<InputGroup.Append>{RandomButton()}</InputGroup.Append>
				</InputGroup>
			</div>
		);
	};

	const columns = [
		{ dataField: "id", text: "Q-Id", headerStyle: { width: "130px", fontSize: "20px" } },
		{ dataField: "question", text: "Questions", headerStyle: { fontSize: "20px" } },
		{ dataField: "_is_selected", text: "Is Selected", hidden: true, sort: true },
		{ dataField: "_search_text", text: "Search Text", hidden: true },
	];

	const selectRow = {
		mode: "checkbox",
		style: { background: dark ? "#393E46" : "#c8e6c9" },
		selected: select,
		onSelect: handleSelect,
		hideSelectAll: true,
	};

	const sortMode = {
		dataField: "_is_selected",
		order: "asc",
	};

	function handleSelect(row, isSelect) {
		let key = topicName.replace(/[^A-Z0-9]+/gi, "_").toLowerCase();
		let newDoneQuestion = [...select];
		let updatedQuestionsStatus = data.questions.map((question, index) => {
			if (row.id === index) {
				question.Done = isSelect;
				if (isSelect) {
					newDoneQuestion.push(row.id);
				} else {
					let pos = newDoneQuestion.indexOf(row.id);
					newDoneQuestion.splice(pos, 1);
				}
			}
			return question;
		});
		updateData(
			key,
			{
				started: newDoneQuestion.length > 0,
				doneQuestions: newDoneQuestion.length,
				questions: updatedQuestionsStatus,
			},
			data.position
		);
		displayToast(isSelect, row.id);
	}

	function displayToast(isSelect, id) {
	const icon = isSelect ? (
		<span role="img" aria-label="celebration">
			🎉
		</span>
	) : (
		<span role="img" aria-label="apology">
			🙇🏻‍♂️
		</span>
	);

	const dir = isSelect ? (
		<span role="img" aria-label="pointing down">
			👇🏻
		</span>
	) : (
		<span role="img" aria-label="pointing up">
			👆🏻
		</span>
	);

	const type = isSelect ? "Done" : "Incomplete";

	const title = (
		<>
			{select.length + (isSelect ? 1 : -1)}/{data.questions.length} Done {icon}
		</>
	);

	const subTitle = <>Question pushed {dir} the table.</>;

	const Card = (
		<>
			<p>{title}</p>
			<p className="toast-subtitle">{subTitle}</p>
		</>
	);

	toast(Card, {
		className: `toast-${type}`,
		autoClose: 2000,
		closeButton: true,
	});
}


	const NoteSection = () => {
		let id = localStorage.getItem("cid");
		const [quickNotes, setQuickNotes] = useState(data.questions[id]?.Notes);

		const addnewnotes = (event) => {
			setQuickNotes(event.target.value);
		};

		const onadd = () => {
			let key = topicName.replace(/[^A-Z0-9]+/gi, "_").toLowerCase();
			if (id) {
				let que = data.questions;
				que[id].Notes = quickNotes.trim();
				updateData(
					key,
					{
						started: data.started,
						doneQuestions: data.doneQuestions,
						questions: que,
					},
					data.position
				);
				localStorage.removeItem("cid");
			}
			saveAndExitNotes();
		};

		return (
			<div className="note-area">
				<div className="note-container">
					<div className="question-title" style={{ color: "black" }}></div>
					<textarea
						maxLength="432"
						className="note-section"
						placeholder="your notes here"
						onChange={addnewnotes}
					></textarea>
					<div className="button-container">
						<button className="note-exit" onClick={saveAndExitNotes}>
							Close
						</button>
						<button className="note-save" onClick={onadd}>
							Save
						</button>
					</div>
				</div>
			</div>
		);
	};

	function saveAndExitNotes() {
		document.getElementsByClassName("note-section")[0].style.display = "none";
		document.getElementsByClassName("note-exit")[0].style.display = "none";
		document.getElementsByClassName("note-save")[0].style.display = "none";
		document.getElementsByClassName("note-area")[0].style.display = "none";
		localStorage.removeItem("cid");
	}

	function RandomButton() {
		let min = 0;
		let max = data.questions.length - 1;
		let rnd = Math.floor(Math.random() * (max - min + 1)) + min;
		return (
			<Button className="pick-random-btn" variant="outline-primary" href={data.questions[rnd].URL} target="_blank">
  Pick Random{" "}
  <span role="img" aria-label="woman-juggling-emoji">
    🤹🏻‍♀️
  </span>
</Button>

		);
	}

	return (
		<>
			<h3 className="text-center mb-4">
				<Link to="/">Topics</Link>/{topicName}
			</h3>

			{data === undefined ? (
				<div className="d-flex justify-content-center">
					<Spinner animation="grow" variant="success" />
				</div>
			) : (
				<ToolkitProvider
					className="float-right"
					keyField="id"
					data={questionsTableData}
					columns={columns}
					rowStyle={{ fontSize: "20px" }}
					search
				>
					{(props) => (
						<div>
							<div className="header-rand">{SearchBar({ ...props.searchProps })}</div>
							<div className="container container-custom" style={{ overflowAnchor: "none" }}>
								<Fade duration={600}>
									<BootstrapTable
										{...props.baseProps}
										selectRow={selectRow}
										sort={sortMode}
										classes={dark ? "dark-table" : ""}
									/>
								</Fade>
							</div>
						</div>
					)}
				</ToolkitProvider>
			)}

			<ToastContainer />
			<NoteSection />
		</>
	);
}
