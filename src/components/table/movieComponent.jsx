import React, {Component} from "react";
import {getMovies} from "../../services/movieService";
import {getGenres} from "../../services/genreService";
import Pagination from "../common/pagination";
import {paginate} from "../../util/paginate";
import Genre from "../common/genreList";
import Table from "./tableComponent";
import _ from "lodash";
import {Link} from "react-router-dom";

class Movie extends Component {
	constructor() {
		super();
		this.handlePageChange = this.handlePageChange.bind(this);
		this.handleSelectedGenre = this.handleSelectedGenre.bind(this);
		this.handleSorting = this.handleSorting.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.state = {
			movies: [],
			genres: [],
			movie_PerPage: 3,
			searchQuery: "",
			selectedGenre: null,
			currentPage: 1,
			sortedTable: {
				tableHeader: "title",
				order: "asc",
			},
		};
	}
	async componentDidMount() {
		let {data: genreApiObject} = await getGenres();
		let {data: movieApiObject} = await getMovies();

		//used for async vibe we can use state directly
		const genres = [{name: "All Genres", _id: ""}, ...genreApiObject];

		this.setState({
			movies: movieApiObject,
			genres: genres,
		});
	}
	handleDeleteMovie(movie) {
		let all_movies = this.state.movies;
		let updated_movie_list = all_movies.filter((eachMovie) => eachMovie._id !== movie._id);
		this.setState({movies: updated_movie_list});
	}
	handlePageChange(pageNumber) {
		this.setState({
			currentPage: pageNumber,
		});
	}

	handleSelectedGenre(genre) {
		this.setState({selectedGenre: genre, searchQuery: "", currentPage: 1});
	}

	handleSearch(e) {
		this.setState({searchQuery: e.currentTarget.value, selectedGenre: null, currentPage: 1});
	}
	handleSorting(tableHeader) {
		this.setState({
			sortedTable: {
				tableHeader: tableHeader,
				order: "asc",
			},
		});
	}

	handleFiltering() {
		const {movies, searchQuery, selectedGenre} = this.state;
		let filtered_movies = movies;
		if (searchQuery) filtered_movies = movies.filter((m) => m.title.toLowerCase().startsWith(searchQuery.toLowerCase()));
		else if (selectedGenre && selectedGenre._id) filtered_movies = movies.filter((eachMovie) => eachMovie.genre._id === selectedGenre._id);
		return filtered_movies;
	}

	render() {
		//*? / const {length: number_of_movies} = this.state.movies;
		// * "number_of_movies" not more necessary because below  "updated_movie_list" is use instead of it !

		// ! obj destructuring for state object

		const {currentPage, movie_PerPage, sortedTable} = this.state;
		// * filtering
		let filtered_movies = this.handleFiltering();

		//* total movies
		const total_number_of_movies = filtered_movies.length;

		// * sorting

		const ordered_movies = _.orderBy(filtered_movies, [sortedTable.tableHeader], [sortedTable.order]);

		// * paginating
		const paginated_movies = paginate(ordered_movies, currentPage, movie_PerPage);

		if (total_number_of_movies === 0) {
			return <p className="m-4">There are no movies in the database</p>;
		}
		return (
			<main className="container pt-20">
				<div className="row">
					<div className="col-3">
						<Genre
							selectedGenre={this.state.selectedGenre}
							genreList={this.state.genres}
							onSelectGenre={this.handleSelectedGenre}
						/>
					</div>
					<div className="col">
						{/* //!  new movie button start */}
						<Link to="/movies/new" className="btn btn-primary">
							New Movie
						</Link>
						{/* //! new movie button start */}
						<p className="m-4">Showing {total_number_of_movies} movies from the database</p>
						<input
							type="text"
							name="query"
							className="form-control my-3"
							placeholder="Search..."
							value={this.state.searchQuery}
							onChange={this.handleSearch}
						/>
						<Table
							onSortTable={this.handleSorting}
							movieList={paginated_movies}
							onDeleteMovie={this.handleDeleteMovie.bind(this)}
						/>

						<Pagination
							totalMovies={total_number_of_movies}
							movie_PerPage={this.state.movie_PerPage}
							onPageChange={this.handlePageChange}
							currentPage={this.state.currentPage}
						/>
					</div>
				</div>
			</main>
		);
	}
}
export default Movie;
