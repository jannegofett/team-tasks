import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const TaskCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <Card className="cursor-move hover:shadow-lg transition-all duration-200">
    <CardHeader className="pb-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" style={{ animationDelay: `${delay}ms` }} />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" style={{ animationDelay: `${delay + 100}ms` }} />
          <Skeleton className="h-6 w-6 rounded-md" style={{ animationDelay: `${delay + 200}ms` }} />
        </div>
      </div>
      <Skeleton className="h-4 w-full" style={{ animationDelay: `${delay + 150}ms` }} />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" style={{ animationDelay: `${delay + 300}ms` }} />
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-4 w-20" style={{ animationDelay: `${delay + 400}ms` }} />
            <Skeleton className="h-3 w-24" style={{ animationDelay: `${delay + 500}ms` }} />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md" style={{ animationDelay: `${delay + 600}ms` }} />
      </div>
    </CardContent>
  </Card>
)

const KanbanColumnSkeleton = ({ taskCount = 2, columnDelay = 0 }: { taskCount?: number; columnDelay?: number }) => (
  <div className="flex-1">
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" style={{ animationDelay: `${columnDelay}ms` }} />
          <Skeleton className="h-5 w-6 rounded-full" style={{ animationDelay: `${columnDelay + 100}ms` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: taskCount }).map((_, index) => (
          <TaskCardSkeleton key={index} delay={columnDelay + (index * 200)} />
        ))}
      </CardContent>
    </Card>
  </div>
)

const KanbanLoading = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      
      <div className="flex gap-6 h-full min-h-[600px]">
        <KanbanColumnSkeleton taskCount={2} columnDelay={0} />
        <KanbanColumnSkeleton taskCount={2} columnDelay={200} />
        <KanbanColumnSkeleton taskCount={2} columnDelay={400} />
      </div>
    </div>
  )
}

export default KanbanLoading
