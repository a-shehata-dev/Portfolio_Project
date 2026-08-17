import { usePagination } from "../../hooks/usePagination";
import { ProjectsAPI } from "../../api/projectsApi";
import PaginatedList from "../../layouts/PaginatedList/PaginatedList";
import ProjectCard from "../../components/ui/ProjectCard/ProjectCard";
import { DEFAULT_PAGE_SIZE } from "../../common/constraints/pagination.constraints";

export default function Projects() {
  const {
    data: projects,
    totalResults,
    currentPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  } = usePagination(
    (page, pageSize) =>
      ProjectsAPI.getProjectsData(page, pageSize).then((res) => ({
        data: res.data.data.data,
        total: res.data.data.totalResults,
      })),
    DEFAULT_PAGE_SIZE,
  );

  return (
    <PaginatedList
      listLength={totalResults}
      handleClickFirstPage={firstPage}
      handleClickLastPage={lastPage}
      handleClickNext={nextPage}
      handleClickPrevious={prevPage}
      currentPage={currentPage}
      title="Projects"
      totalResults={totalResults}
      childrenList={
        projects.length > 0
          ? projects.map((project: any) => (
              <ProjectCard
                id={project.id}
                key={project.id}
                name={project.name}
                overview={project.overview}
                url={project.url}
                github={project.github}
                images={project.images}
                skills={project.skills}
              />
            ))
          : []
      }
    />
  );
}
